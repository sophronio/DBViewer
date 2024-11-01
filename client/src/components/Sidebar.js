import React, { useState, useEffect } from 'react';
import '../styles/Sidebar.css';
import axios from 'axios';

const Sidebar = ({ onComponentChange }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
        <div class="sidebar bg-gray-200 p-4 w-1/4">
            <h2 class="text-xl font-bold">Sidebar</h2>
            <ul class="space-y-4">
                {data.map((name) => (
                    <li>
                        <button
                            class="btn"
                            onClick={() => onComponentChange(name)}
                        >
                            {name}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;
