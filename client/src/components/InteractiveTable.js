import React from 'react';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../styles/InteractiveTable.css';
import { fetchData, getPrimaryKey } from '../utils.js';

const InteractiveTable = ({
    tableName,
    onTotalResultsChange,
    limit,
    offset,
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalResults, setTotalResults] = useState(0);

    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [editedData, setEditedData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [newRow, setNewRow] = useState({});
    const [newColumn, setNewColumn] = useState('');
    // useRef to store original rows (so it doesn't trigger a re-render)
    const originalRowsRef = useRef([]);

    useEffect(() => {
        fetchData(
            tableName,
            limit,
            offset,
            setData,
            setTotalResults,
            setLoading,
            setError,
            setColumns
        );
    }, [tableName, totalResults, limit, offset]);

    // Get the primary key
    const primaryKey = data.length > 0 ? getPrimaryKey(columns) : null;

    // Whenever totalResults changes, propagate it up to the parent
    useEffect(() => {
        onTotalResultsChange(totalResults); // Propagate the totalResults to the parent
    }, [totalResults, onTotalResultsChange]);

    // Edit button click
    const handleEdit = () => {
        setIsEditing(true);
    };

    // Cancel edits and revert the table to the original data
    const handleCancel = () => {
        setIsEditing(false);
        setEditedData({}); // Clear edited rows
        setData([...originalRowsRef.current]); // Reset rows to original data from ref
    };

    // Input changes
    const handleInputChange = (e, rowId, column) => {
        setEditedData((prevEditedRows) => ({
            ...prevEditedRows,
            [rowId]: {
                ...prevEditedRows[rowId],
                [column]: e.target.value,
            },
        }));

        // Reflect the edits in the table visually without modifying the originalRowsRef
        setData((prevRows) =>
            prevRows.map((row) =>
                row[primaryKey] === rowId
                    ? { ...row, [column]: e.target.value }
                    : row
            )
        );
    };

    // Handle save
    const handleSave = async () => {
        try {
            const updates = Object.entries(editedData).map(
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

            // Refetch fresh data from db
            fetchData(
                tableName,
                limit,
                offset,
                setData,
                setTotalResults,
                setLoading,
                setError,
                originalRowsRef
            );
            setIsEditing(false);
            setEditedData({});
        } catch (error) {
            console.error('Error saving data:', error);
            setError('Error saving data');
        }
    };

    if (loading) {
        return <p> Loading data...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }
    console.log(data.length);
    return (
        <div className="table-container">
            <h1 className="text-2xl font-bold">{tableName} Table</h1>
            {/* Edit and Save buttons outside the table */}
            <div style={{ marginTop: '20px' }}>
                {!isEditing ? (
                    <button onClick={handleEdit}>Edit</button>
                ) : (
                    <>
                        <button onClick={handleSave}>Save</button>
                        <button
                            onClick={handleCancel}
                            style={{ marginLeft: '10px' }}
                        >
                            Cancel
                        </button>
                    </>
                )}
            </div>
            <table className="border-collapse border border-gray-400 w-full">
                <thead>
                    <tr>
                        {data.length > 0 &&
                            columns.map((column) => (
                                <th key={column}>{column}</th>
                            ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row) => (
                        <tr key={row[primaryKey]}>
                            {Object.keys(row).map((column) => (
                                <td key={column}>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={
                                                editedData[row[primaryKey]]?.[
                                                    column
                                                ] || row[column]
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
                </tbody>
            </table>
        </div>
    );
};

export default InteractiveTable;
