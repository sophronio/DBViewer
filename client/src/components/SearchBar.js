import React, { useEffect, useState } from 'react';

const SearchBar = ({ query, onSearch, onQueryChange }) => {
    const [message, setMessage] = useState(''); // Message displayed to user
    const [debounceTimeout, setDebounceTimeout] = useState(null);

    const handleChange = (event) => {
        const input = event.target.value;
        onQueryChange(input); // Update the query in the parent component

        // Clear any previous debounce timers
        if (debounceTimeout) clearTimeout(debounceTimeout);

        // Only show "Press Enter" message if the input is less than 2 characters
        if (input.length < 2 && input.length > 0) {
            setMessage(
                'Please enter at least 2 characters to start the search.'
            );
            return;
        } else if (input.length === 0) {
            setMessage('');
            onSearch(''); // Clear search when input is empty
        } else {
            setMessage('');
            // Set a debounce timer to wait for user to stop typing
            const newTimeout = setTimeout(() => {
                onSearch(input);
            }, 500); // Waits 500ms after typing stops

            setDebounceTimeout(newTimeout);
        }
    };

    // Update the local input field if the query prop changes
    useEffect(() => {
        if (query === '') setMessage(''); // Clear the message if query is reset
    }, [query]);

    // Clean up the timeout when the component unmounts
    useEffect(() => {
        return () => {
            if (debounceTimeout) clearTimeout(debounceTimeout);
        };
    }, [debounceTimeout]);

    return (
        <div className="mb-4">
            <input
                type="text"
                value={query}
                onChange={handleChange}
                placeholder="Search..."
                className="border p-2 w-full dark:bg-gray-700 dark:text-gray-100"
            />
            {message && <p className="text-gray-500 text-sm mt-1">{message}</p>}
        </div>
    );
};

export default SearchBar;
