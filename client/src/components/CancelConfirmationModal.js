import React from 'react';

const CancelConfirmationModal = ({ onConfirm, onCancel }) => (
    <div className="fixed inset-0 flex items-center justify-center text-black dark:text-gray-100 bg-gray-500 bg-opacity-75">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-lg font-bold mb-4">Confirm Cancel</h2>
            <p>Are you sure you want to discard your changes?</p>
            <div className="mt-4 flex justify-end space-x-2">
                <button
                    onClick={onCancel}
                    className="bg-gray-300 px-4 py-2 rounded dark:bg-gray-600"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className="bg-red-600 text-white px-4 py-2 rounded dark:bg-red-700"
                >
                    Discard
                </button>
            </div>
        </div>
    </div>
);

export default CancelConfirmationModal;
