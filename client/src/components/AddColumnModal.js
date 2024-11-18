import React, { useState, useEffect } from 'react';
import { fetchSqlTypes } from '../utils.js';

const AddColumnModal = ({ onClose, onAddColumn }) => {
    const [newColumn, setNewColumn] = useState('');
    const [newColumnType, setNewColumnType] = useState('');
    const [newColumnSize, setNewColumnSize] = useState('');
    const [sqlTypes, setSqlTypes] = useState([]);
    const [sizeOptions, setSizeOptions] = useState({});
    const [availableOptions, setAvailableOptions] = useState([]);
    // Fetch SQL types and size options from backend
    useEffect(() => {
        fetchSqlTypes(setSqlTypes, setSizeOptions);
    }, []);

    // When column type changes, update available size options
    const handleColumnTypeChange = (e) => {
        const selectedType = e.target.value;
        setNewColumnType(selectedType);
        setAvailableOptions([]);
        // // Find the selected type's size options (if any) and update sizeOptions
        const typesWithSize = Object.keys(sizeOptions);

        const selectedTypeDetails = typesWithSize.find(
            (type) => type === selectedType
        );

        if (selectedTypeDetails && sizeOptions[selectedTypeDetails]) {
            setAvailableOptions(sizeOptions[selectedTypeDetails]);
        } else {
            setAvailableOptions([]);
            setNewColumnSize(''); // Clear the size field
        }
    };
    // Handle form submission for adding a new column
    const handleSubmit = (e) => {
        e.preventDefault();
        if (newColumn.trim() && newColumnType) {
            // Call the parent function to add the column
            onAddColumn(newColumn, newColumnType, newColumnSize || null);
            onClose(); // Close the modal
        }
    };

    return (
        <div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-1/3 p-6">
                <h2 class="text-2xl dark:text-gray-100 font-semibold mb-4">
                    Add New Column
                </h2>
                <form onSubmit={handleSubmit}>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Column Name:
                        </label>
                        <input
                            type="text"
                            value={newColumn}
                            onChange={(e) => setNewColumn(e.target.value)}
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 dark:bg-gray-700 dark:text-gray-100"
                            required
                        />
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Column Type:
                        </label>
                        <select
                            value={newColumnType}
                            onChange={handleColumnTypeChange}
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 dark:bg-gray-700 dark:text-gray-100"
                            required
                        >
                            <option value="">Select Type</option>
                            {sqlTypes.map((type) => (
                                <option key={type.name} value={type.name}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {availableOptions.length > 0 && (
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-100">
                                Size:
                            </label>
                            <select
                                value={newColumnSize}
                                onChange={(e) =>
                                    setNewColumnSize(e.target.value)
                                }
                                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 dark:text-gray-100 dark:bg-gray-700"
                            >
                                <option value="">Select Size</option>
                                {availableOptions.map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div class="flex justify-end space-x-3">
                        <button
                            type="button"
                            class="bg-gray-500 text-white py-2 px-4 rounded"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            class="bg-blue-500 text-white py-2 px-4 rounded"
                        >
                            Add Column
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddColumnModal;
