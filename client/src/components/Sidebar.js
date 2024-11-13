import React, { useState, useEffect } from 'react';
import '../styles/Sidebar.css';
import axios from 'axios';
import { useDarkMode } from '../DarkModeContext';

const Sidebar = ({ onComponentChange }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { darkMode, toggleDarkMode } = useDarkMode();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    'http://localhost:8080/tables'
                );
                setData(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <p> Loading data...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div class="h-screen flex">
            <div class="flex flex-col justify-between w-64 bg-gray-200 dark:bg-gray-800 p-4">
                <div>
                    <h2 class="dark:text-gray-100 text-xl font-bold mb-4">
                        Sidebar
                    </h2>
                    <ul>
                        {data.map((name) => (
                            <li key={name} class="mb-2">
                                <button
                                    class="btn w-full text-left"
                                    onClick={() => onComponentChange(name)}
                                >
                                    {name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <button
                    onClick={toggleDarkMode}
                    class="mt-auto rounded bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-2"
                >
                    {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
