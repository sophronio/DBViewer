import React, { useState, useEffect } from 'react';
import '../styles/Sidebar.css';
import axios from 'axios';
import { useDarkMode } from '../DarkModeContext';
import { MdDarkMode, MdOutlineLightMode } from 'react-icons/md';
import {
    IoIosArrowDropleftCircle,
    IoIosArrowDroprightCircle,
} from 'react-icons/io';
const Sidebar = ({ onComponentChange }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOpen, setIsOpen] = useState(true);
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

    const toggleSidebar = () => {
        setIsOpen(!isOpen); // Toggle sidebar open/close state
    };

    if (loading) {
        return <p> Loading data...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div class="h-screen flex">
            <div
                class={`flex flex-col justify-between ${
                    isOpen ? 'w-64' : 'w-12'
                } bg-gray-200 dark:bg-gray-800 p-4 transition-width duration-300`}
            >
                <div>
                    <div class="flex items-center justify-between mb-4">
                        <h2
                            class={`text-xl font-bold dark:text-gray-100 ${!isOpen && 'hidden'}`}
                        >
                            Sidebar
                        </h2>
                        <button
                            onClick={toggleSidebar}
                            class="text-gray-600 dark:text-gray-300 text-xl"
                        >
                            {isOpen ? (
                                <IoIosArrowDropleftCircle />
                            ) : (
                                <IoIosArrowDroprightCircle />
                            )}
                        </button>
                    </div>
                    <ul class={`${!isOpen && 'hidden'}`}>
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
                <label
                    class={`inline-flex items-center cursor-pointer ${!isOpen && 'hidden'}`}
                >
                    <input
                        type="checkbox"
                        onChange={toggleDarkMode}
                        checked={darkMode ? true : false}
                        class="sr-only peer"
                    />
                    <div class="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gray-900"></div>
                    <span class="ms-3 font-medium text-lg text-gray-900 dark:text-gray-300">
                        {darkMode ? <MdOutlineLightMode /> : <MdDarkMode />}
                    </span>
                </label>
            </div>
        </div>
        // <div class="h-screen flex">
        //     <div class="flex flex-col justify-between w-64 bg-gray-200 dark:bg-gray-800 p-4">
        //         <div>
        //             <h2 class="dark:text-gray-100 text-xl font-bold mb-4">
        //                 Sidebar
        //             </h2>
        //             <ul>
        //                 {data.map((name) => (
        //                     <li key={name} class="mb-2">
        //                         <button
        //                             class="btn w-full text-left"
        //                             onClick={() => onComponentChange(name)}
        //                         >
        //                             {name}
        //                         </button>
        //                     </li>
        //                 ))}
        //             </ul>
        //         </div>

        //     </div>
        // </div>
    );
};

export default Sidebar;
