import React from 'react';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { fetchData, getPrimaryKey, getDefaultColumnValue } from '../utils.js';
import AddColumnModal from './AddColumnModal';

const InteractiveTable = ({
    tableName,
    onTotalResultsChange,
    limit,
    offset,
}) => {
    // loading + error
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalResults, setTotalResults] = useState(0);
    const [isEditing, setIsEditing] = useState(false);

    // rows + add rows
    const [rows, setRows] = useState([]);
    const [editedRows, setEditedRows] = useState({});
    const [newRows, setNewRows] = useState([]);

    // columns
    const [columns, setColumns] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // useRef to store original rows (so it doesn't trigger a re-render)
    const originalRowsRef = useRef([]);

    // gets table data
    useEffect(() => {
        fetchData(
            tableName,
            limit,
            offset,
            setRows,
            setColumns,
            setTotalResults,
            setLoading,
            setError,
            originalRowsRef
        );
        setIsEditing(false); // stop editing when user changes table
    }, [tableName, totalResults, limit, offset]);

    // Get the primary key
    const primaryKey = rows.length > 0 ? getPrimaryKey(columns) : null;

    // Whenever totalResults changes, propagate it up to the parent
    useEffect(() => {
        onTotalResultsChange(totalResults); // Propagate the totalResults to the parent
    }, [totalResults, onTotalResultsChange]);

    // Edit button click
    const handleEdit = () => {
        setNewRows([]);
        setIsEditing(true);
        // const initialEditedRows = rows.reduce((acc, row) => {
        //     acc[row[primaryKey]] = { ...row };
        //     return acc;
        // }, {});
        // setEditedRows(initialEditedRows);
    };

    // Cancel edits and revert the table to the original rows
    const handleCancel = () => {
        setIsEditing(false);
        setEditedRows({}); // Clear edited rows
        console.log(originalRowsRef);
        setRows([...originalRowsRef.current]); // Reset rows to original data from ref
        setNewRows([]);
    };

    // Handle value input
    const handleInputChange = (e, rowId, column, isNewRow = false) => {
        if (isNewRow) {
            const updatedNewRows = [...newRows];
            updatedNewRows[rowId][column] = e.target.value;
            setNewRows(updatedNewRows);
        } else {
            setEditedRows((prevEditedRows) => ({
                ...prevEditedRows,
                [rowId]: {
                    ...prevEditedRows[rowId],
                    [column]: e.target.value,
                },
            }));
        }

        // Reflect the edits in the table visually without modifying the originalRowsRef
        setRows((prevRows) =>
            prevRows.map((row) =>
                row[primaryKey] === rowId
                    ? { ...row, [column]: e.target.value }
                    : row
            )
        );
    };

    // Save edits to database + any new rows
    const handleSave = async () => {
        try {
            const updates = Object.entries(editedRows).map(
                ([rowId, updatedRow]) => {
                    if (columns.includes('updated_at')) {
                        const updatedAt = new Date().toISOString();
                        console.log(updatedRow);
                        return axios.put('http://localhost:8080/updates', {
                            tableName,
                            data: { ...updatedRow, updated_at: updatedAt },
                            primaryKey,
                            primaryKeyValue: rowId,
                        });
                    } else {
                        return axios.put('http://localhost:8080/updates', {
                            tableName,
                            data: updatedRow,
                            primaryKey,
                            primaryKeyValue: rowId,
                        });
                    }
                }
            );

            // Send all updates in parallel
            await Promise.all(updates);

            console.log(newRows);
            newRows.forEach((newRow) => {
                const filteredColumns = Object.keys(newRow).filter(
                    (column) => column !== primaryKey
                );
                const filteredValues = filteredColumns.map(
                    (column) => newRow[column]
                );
                axios
                    .post('http://localhost:8080/add-row', {
                        tableName,
                        columns: filteredColumns,
                        values: filteredValues,
                    })
                    .then((response) =>
                        console.log('New row inserted', response)
                    );
            });
            setIsEditing(false);
            setEditedRows({});
            setNewRows([]);
            // Refetch fresh data from db
            fetchData(
                tableName,
                limit,
                offset,
                setRows,
                setColumns,
                setTotalResults,
                setLoading,
                setError,
                originalRowsRef
            );
        } catch (error) {
            console.error('Error saving data:', error);
            setError('Error saving data');
        }
    };

    const handleAddRow = () => {
        // Add an empty row object with keys from columns and empty values
        const emptyRow = columns.reduce(
            (acc, col) => ({ ...acc, [col]: '' }),
            {}
        );
        setNewRows([...newRows, emptyRow]);
        setIsEditing(true);
    };

    const handleAddColumn = (newColumn, newColumnType, newColumnSize) => {
        console.log('size type', typeof newColumnSize);
        const updatedRows = rows.map((row) => ({
            ...row,
            [newColumn]: getDefaultColumnValue(newColumnType),
        }));
        setRows(updatedRows);
        axios.post('http://localhost:8080/add-column', {
            tableName,
            columnName: newColumn,
            columnType: newColumnType,
            columnSize: newColumnSize,
        });
        fetchData(
            tableName,
            limit,
            offset,
            setRows,
            setColumns,
            setTotalResults,
            setLoading,
            setError,
            originalRowsRef
        );
        handleCloseModal();
    };
    // Handle opening the modal
    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    // Handle closing the modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    if (loading) {
        return <p> Loading data...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }
    return (
        <div>
            <h1 class="text-2xl font-bold">{tableName} Table</h1>

            {/* Edit and Save buttons outside the table */}
            <div class="">
                {!isEditing ? (
                    <button onClick={handleEdit}>Edit</button>
                ) : (
                    <>
                        <button onClick={handleSave}>Save</button>
                        <button onClick={handleCancel} class="ml-4">
                            Cancel
                        </button>
                    </>
                )}
            </div>

            <div class="table-button-container flex relative overflow-x-auto">
                <table class="w-full text-base text-left">
                    <thead>
                        <tr>
                            {rows.length > 0 &&
                                columns.map((column) => (
                                    <th
                                        class="px-6 py-3 border border-black"
                                        scope="col"
                                        key={column}
                                    >
                                        {column}
                                    </th>
                                ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr
                                class="bg-white border border-black"
                                key={row[primaryKey]}
                            >
                                {Object.keys(row).map((column) => (
                                    <td
                                        class="px-6 py-4 border-r border-black"
                                        key={column}
                                    >
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={
                                                    editedRows[
                                                        row[primaryKey]
                                                    ]?.[column] || row[column]
                                                }
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        e,
                                                        row[primaryKey],
                                                        column
                                                    )
                                                }
                                            />
                                        ) : (
                                            row[column]
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {/* Render new rows when in editing mode */}
                        {isEditing &&
                            newRows.map((newRow, newRowIndex) => (
                                <tr
                                    class="bg-gray-100 border border-black"
                                    key={`new-row-${newRowIndex}`}
                                >
                                    {columns.map((column) => (
                                        <td
                                            class="px-6 py-4 border-r border-black"
                                            key={`${column}-${newRowIndex}`}
                                        >
                                            <input
                                                type="text"
                                                value={newRow[column] || ''}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        e,
                                                        newRowIndex,
                                                        column,
                                                        true
                                                    )
                                                }
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                    </tbody>
                    {isEditing && (
                        <tfoot>
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    class="border border-black"
                                >
                                    <button
                                        class="w-full rounded-none"
                                        onClick={handleAddRow}
                                    >
                                        +
                                    </button>
                                </td>
                            </tr>
                        </tfoot>
                    )}
                </table>
                {isEditing && (
                    <button
                        class="px-6 rounded-none border-0 border-r-2 border-t border-b border-solid border-black"
                        onClick={handleOpenModal}
                    >
                        +
                    </button>
                )}
            </div>

            {/* AddColumnModal component */}
            {isModalOpen && (
                <AddColumnModal
                    onClose={handleCloseModal}
                    onAddColumn={handleAddColumn}
                />
            )}
        </div>
    );
};

export default InteractiveTable;
