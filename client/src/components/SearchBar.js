import React, { useState, useEffect } from 'react';

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');
    const [message, setMessage] = useState(''); // Message displayed to user
    const [debounceTimeout, setDebounceTimeout] = useState(null);

    const handleChange = (event) => {
        const input = event.target.value;
        setQuery(input);

        // Clear any previous debounce timers
        if (debounceTimeout) clearTimeout(debounceTimeout);

        // Only show "Press Enter" message if the input is less than 2 characters
        if (input.length < 2 && input.length > 0) {
            setMessage(
                'Please enter at least 2 characters to start the search.'
            );
            return;
        } else if (input.length === 0) {
            // Clear the message if the input length meets the requirement
            setMessage('');
            onSearch('');
        } else {
            setMessage('');
            // Set a debounce timer to wait for user to stop typing
            const newTimeout = setTimeout(() => {
                onSearch(input);
            }, 500); // Waits 500ms after typing stops

            setDebounceTimeout(newTimeout);
        }
    };

    // Clean up the timeout when the component unmounts
    useEffect(() => {
        return () => {
            if (debounceTimeout) clearTimeout(debounceTimeout);
        };
    }, [debounceTimeout]);

    return (
        <div class="mb-4">
            <input
                type="text"
                value={query}
                onChange={handleChange}
                placeholder="Search..."
                class="border p-2 w-full dark:bg-gray-700 dark:text-gray-100"
            />
            {message && <p className="text-gray-500 text-sm mt-1">{message}</p>}
        </div>
    );
};

export default SearchBar;
