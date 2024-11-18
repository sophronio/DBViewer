import React from 'react';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { fetchData, getPrimaryKey, getDefaultColumnValue } from '../utils.js';
import AddColumnModal from './AddColumnModal';
import InteractiveTableSkeleton from './InteractiveTableSkeleton';
import SaveConfirmationModal from './SaveConfirmationModal';
import CancelConfirmationModal from './CancelConfirmationModal';
import { FaRegSquarePlus } from 'react-icons/fa6';

const InteractiveTable = ({
    tableName,
    onTotalResultsChange,
    limit,
    offset,
    searchQuery,
    setHasUnsavedChanges,
    hasUnsavedChanges,
}) => {
    // loading + error
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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

    // save & cancel modal
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    // Detect unsaved changes
    useEffect(() => {
        const newUnsavedChanges =
            Object.keys(editedRows).length > 0 || newRows.length > 0;
        if (newUnsavedChanges !== hasUnsavedChanges) {
            setHasUnsavedChanges(newUnsavedChanges);
        }
    }, [editedRows, newRows, setHasUnsavedChanges, hasUnsavedChanges]);

    // Warn user on page refresh or tab close
    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (hasUnsavedChanges) {
                const message =
                    'You have unsaved changes. If you leave, your changes will be lost.';
                event.returnValue = message; // Standard for most browsers
                return message; // For some browsers like Chrome
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [hasUnsavedChanges]);

    // search querying
    // const [isSearching, setIsSearching] = useState(false);
    // gets table data
    useEffect(() => {
        fetchData(
            tableName,
            limit,
            offset,
            setRows,
            setColumns,
            onTotalResultsChange,
            setLoading,
            setError,
            originalRowsRef,
            searchQuery
        );
        // setEditedRows({});
        if (!hasUnsavedChanges) {
            setIsEditing(false); // stop editing when user changes table
        }
    }, [
        searchQuery,
        limit,
        offset,
        tableName,
        onTotalResultsChange,
        hasUnsavedChanges,
    ]);

    // Get the primary key
    const primaryKey = rows.length > 0 ? getPrimaryKey(columns) : null;

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
        if (hasUnsavedChanges) {
            setShowCancelModal(true);
        } else {
            confirmCancel();
        }
    };

    const confirmCancel = () => {
        setIsEditing(false);
        setEditedRows({});
        setRows([...originalRowsRef.current]);
        setNewRows([]);
        setShowCancelModal(false);
    };

    // Handle value input
    // const handleInputChange = (e, rowId, column, isNewRow = false) => {
    //     if (isNewRow) {
    //         const updatedNewRows = [...newRows];
    //         updatedNewRows[rowId][column] = e.target.value;
    //         setNewRows(updatedNewRows);
    //     } else {
    //         setEditedRows((prevEditedRows) => ({
    //             ...prevEditedRows,
    //             [rowId]: {
    //                 ...prevEditedRows[rowId],
    //                 [column]: e.target.value,
    //             },
    //         }));
    //     }

    //     // Reflect the edits in the table visually without modifying the originalRowsRef
    //     setRows((prevRows) =>
    //         prevRows.map((row) =>
    //             row[primaryKey] === rowId
    //                 ? { ...row, [column]: e.target.value }
    //                 : row
    //         )
    //     );
    // };
    const handleInputChange = (e, rowId, column, isNewRow = false) => {
        const value = e.target.value;
        if (isNewRow) {
            const updatedNewRows = [...newRows];
            updatedNewRows[rowId][column] = e.target.value;
            setNewRows(updatedNewRows);
        } else {
            // Update the editedRows state
            setEditedRows((prevEditedRows) => {
                const updatedEditedRows = {
                    ...prevEditedRows,
                    [rowId]: {
                        ...prevEditedRows[rowId],
                        [column]: value, // Update the user_id here
                    },
                };

                return updatedEditedRows;
            });
        }

        // Update rows to reflect the new value immediately
        setRows((prevRows) => {
            return prevRows.map((row) =>
                row[primaryKey] === rowId
                    ? { ...row, [column]: value } // Ensure the row gets updated here
                    : row
            );
        });
    };

    const handleSave = () => {
        setShowSaveModal(true);
    };

    // Save edits to database + any new rows
    const confirmSave = async () => {
        try {
            const updates = Object.entries(editedRows).map(
                ([rowId, updatedRow]) => {
                    if (columns.includes('updated_at')) {
                        const updatedAt = new Date().toISOString();

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

            const newRowUpdates = newRows.map((newRow) => {
                const filteredColumns = Object.keys(newRow).filter(
                    (column) => column !== primaryKey
                );
                const filteredValues = filteredColumns.map(
                    (column) => newRow[column]
                );
                return axios.post('http://localhost:8080/add-row', {
                    tableName,
                    columns: filteredColumns,
                    values: filteredValues,
                });
            });

            await Promise.all(newRowUpdates);
            await fetchData(
                tableName,
                limit,
                offset,
                setRows,
                setColumns,
                onTotalResultsChange,
                setLoading,
                setError,
                originalRowsRef
            );

            setIsEditing(false);
            setEditedRows({});
            setNewRows([]);
            // Refetch fresh data from db
        } catch (error) {
            console.error('Error saving data:', error);
            setError('Error saving data');
        } finally {
            setShowSaveModal(false);
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

    const handleAddColumn = async (newColumn, newColumnType, newColumnSize) => {
        const updatedRows = rows.map((row) => ({
            ...row,
            [newColumn]: getDefaultColumnValue(newColumnType),
        }));
        setRows(updatedRows);
        await axios.post('http://localhost:8080/add-column', {
            tableName,
            columnName: newColumn,
            columnType: newColumnType,
            columnSize: newColumnSize,
        });
        await fetchData(
            tableName,
            limit,
            offset,
            setRows,
            setColumns,
            onTotalResultsChange,
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

    if (error) {
        return <p class="text-red-500">Error: {error}</p>;
    }
    return (
        <>
            {!loading ? (
                <div class="fade-in fade-in-active">
                    <h1 class="text-2xl font-bold dark:text-gray-100">
                        {tableName} Table
                    </h1>
                    {/* Edit and Save buttons outside the table */}
                    {rows.length === 0 ? (
                        <div class="dark:text-gray-100 container border text-center">
                            <p>
                                Nothing to see here...Please try a different
                                search
                            </p>
                        </div>
                    ) : (
                        <>
                            <div class="dark:text-gray-100 mb-1">
                                {!isEditing ? (
                                    <button
                                        class="dark:bg-gray-700 bg-gray-100 rounded px-1"
                                        onClick={handleEdit}
                                    >
                                        Edit
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            class="dark:bg-gray-700 bg-gray-100 rounded px-1"
                                            onClick={handleSave}
                                        >
                                            Save
                                        </button>
                                        <button
                                            class="dark:bg-gray-700 bg-gray-100 ml-4 rounded px-1"
                                            onClick={handleCancel}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                )}
                            </div>

                            <div class="table-button-container flex relative overflow-x-auto">
                                <table class="dark:bg-gray-800 w-full text-base text-left">
                                    <thead>
                                        <tr>
                                            {columns.map((column) => (
                                                <th
                                                    class="dark:text-gray-100 px-6 py-3 border border-black"
                                                    scope="col"
                                                    key={column}
                                                >
                                                    {column === primaryKey
                                                        ? column + ' (PK)'
                                                        : column}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    {/* <tbody>
                                        {rows.map((row, index) => (
                                            <tr
                                                class="bg-white dark:bg-gray-700 dark:text-gray-100 border border-black"
                                                key={row[primaryKey] - index}
                                            >
                                                {Object.keys(row).map(
                                                    (column) => (
                                                        <td
                                                            class="px-6 py-4 border-r border-black"
                                                            key={column + row}
                                                        >
                                                            {isEditing &&
                                                            column !==
                                                                primaryKey ? ( // Only enable input for non-primary key columns
                                                                <input
                                                                    className="dark:bg-gray-800"
                                                                    type="text"
                                                                    value={
                                                                        editedRows[
                                                                            row[
                                                                                primaryKey
                                                                            ]
                                                                        ]?.[
                                                                            column
                                                                        ] ||
                                                                        row[
                                                                            column
                                                                        ]
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleInputChange(
                                                                            e,
                                                                            row[
                                                                                primaryKey
                                                                            ] -
                                                                                index,
                                                                            column
                                                                        )
                                                                    }
                                                                />
                                                            ) : (
                                                                row[column] // For the primary key, just display the value (no input)
                                                            )}
                                                        </td>
                                                    )
                                                )}
                                            </tr>
                                        ))}

                                        {isEditing &&
                                            newRows.map(
                                                (newRow, newRowIndex) => (
                                                    <tr
                                                        class="bg-gray-100 border border-black"
                                                        key={`new-row-${newRowIndex}`}
                                                    >
                                                        {columns.map(
                                                            (column) => (
                                                                <td
                                                                    class="px-6 py-4 border-r border-black"
                                                                    key={`${column}-${newRowIndex}`}
                                                                >
                                                                    <input
                                                                        type="text"
                                                                        value={
                                                                            newRow[
                                                                                column
                                                                            ] ||
                                                                            ''
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleInputChange(
                                                                                e,
                                                                                newRowIndex,
                                                                                column,
                                                                                true
                                                                            )
                                                                        }
                                                                    />
                                                                </td>
                                                            )
                                                        )}
                                                    </tr>
                                                )
                                            )}
                                    </tbody> */}
                                    <tbody>
                                        {rows.map((row) => (
                                            <tr
                                                key={row[primaryKey]} // Ensure the primaryKey is used as the key for each row
                                                className="bg-white dark:bg-gray-700 dark:text-gray-100 border border-black"
                                            >
                                                {Object.keys(row).map(
                                                    (column) => (
                                                        <td
                                                            className="px-6 py-4 border-r border-black"
                                                            key={column}
                                                        >
                                                            {isEditing &&
                                                            column !==
                                                                primaryKey ? (
                                                                <input
                                                                    class="dark:bg-gray-800"
                                                                    type="text"
                                                                    value={
                                                                        editedRows[
                                                                            row[
                                                                                primaryKey
                                                                            ]
                                                                        ]?.[
                                                                            column
                                                                        ] !==
                                                                        undefined
                                                                            ? editedRows[
                                                                                  row[
                                                                                      primaryKey
                                                                                  ]
                                                                              ]?.[
                                                                                  column
                                                                              ]
                                                                            : row[
                                                                                  column
                                                                              ] // If editedRows is undefined or empty, fallback to original value
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleInputChange(
                                                                            e,
                                                                            row[
                                                                                primaryKey
                                                                            ],
                                                                            column
                                                                        )
                                                                    } // Pass rowId and column
                                                                />
                                                            ) : (
                                                                row[column]
                                                            )}
                                                        </td>
                                                    )
                                                )}
                                            </tr>
                                        ))}
                                        {isEditing &&
                                            newRows.map(
                                                (newRow, newRowIndex) => (
                                                    <tr
                                                        class="bg-gray-100 border border-black dark:bg-gray-700 dark:text-gray-100 "
                                                        key={`new-row-${newRowIndex}`}
                                                    >
                                                        {columns.map(
                                                            (column) => (
                                                                <td
                                                                    class="px-6 py-4 border-r border-black"
                                                                    key={`${column}-${newRowIndex}`}
                                                                >
                                                                    {column !==
                                                                    primaryKey ? (
                                                                        <input
                                                                            class="dark:bg-gray-800"
                                                                            type="text"
                                                                            value={
                                                                                newRow[
                                                                                    column
                                                                                ] ||
                                                                                ''
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) =>
                                                                                handleInputChange(
                                                                                    e,
                                                                                    newRowIndex,
                                                                                    column,
                                                                                    true
                                                                                )
                                                                            }
                                                                        />
                                                                    ) : (
                                                                        'Auto-generated' // FLAG: need to address in next release
                                                                    )}
                                                                </td>
                                                            )
                                                        )}
                                                    </tr>
                                                )
                                            )}
                                    </tbody>

                                    {isEditing && (
                                        <tfoot>
                                            <tr>
                                                <td
                                                    colSpan={columns.length}
                                                    class="border border-black h-full "
                                                >
                                                    <button
                                                        class="text-2xl py-4 w-full rounded-none justify-items-center dark:text-gray-100"
                                                        onClick={handleAddRow}
                                                    >
                                                        <FaRegSquarePlus />
                                                    </button>
                                                </td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>

                                {isEditing && (
                                    <button
                                        class="text-2xl px-6 rounded-none border-0 border-r border-t border-b border-solid border-black dark:text-gray-100 dark:hover:bg-blue-600 dark:bg-gray-800"
                                        onClick={handleOpenModal}
                                    >
                                        <FaRegSquarePlus />
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                    {/* Conditionally render modals */}
                    {showSaveModal && (
                        <SaveConfirmationModal
                            onConfirm={confirmSave}
                            onCancel={() => setShowSaveModal(false)}
                        />
                    )}
                    {showCancelModal && (
                        <CancelConfirmationModal
                            onConfirm={confirmCancel}
                            onCancel={() => setShowCancelModal(false)}
                        />
                    )}
                    {/* AddColumnModal component */}
                    {isModalOpen && (
                        <AddColumnModal
                            onClose={handleCloseModal}
                            onAddColumn={handleAddColumn}
                        />
                    )}
                </div>
            ) : (
                <InteractiveTableSkeleton />
            )}
        </>
    );
};

export default InteractiveTable;
