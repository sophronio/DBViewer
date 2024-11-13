import React, { useState } from 'react';
import Sidebar from './Sidebar';
import InteractiveTable from './InteractiveTable';
import PageSelector from './PageSelector';
import SearchBar from './SearchBar';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const [activeComponent, setActiveComponent] = useState('');
    const [limit, setLimit] = useState(10);
    const [offset, setOffset] = useState(0);
    const [totalResults, setTotalResults] = useState(0);
    const [searchQuery, setSearchQuery] = useState(''); // New state for search query

    // Handle component change from sidebar clicks
    const handleComponentChange = (componentName) => {
        setActiveComponent(componentName);
        setLimit(5);
        setOffset(0);
        setSearchQuery(''); // Clear the search query when switching components
    };
    // Callback function to receive totalResults from InteractiveTable
    const handleTotalResults = (newTotalResults) => {
        setTotalResults(newTotalResults);
    };

    const handlePageChange = (newLimit, newOffset) => {
        setLimit(newLimit);
        setOffset(newOffset);
        // Trigger data fetch or update based on new limit and offset
        console.log(
            `Fetching ${newLimit} results starting from offset ${newOffset}`
        );
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        setOffset(0); // Reset offset to 0 when a new search is performed
    };
    return (
        <div class="dashboard-container flex bg-gray-300 dark:bg-gray-900">
            <Sidebar onComponentChange={handleComponentChange} />

            {activeComponent !== '' ? (
                <div class="content-area flex-1 p-4">
                    <SearchBar onSearch={handleSearch} />
                    <InteractiveTable
                        key={limit + offset}
                        tableName={activeComponent}
                        onTotalResultsChange={handleTotalResults}
                        limit={limit}
                        offset={offset}
                        searchQuery={searchQuery} // Pass search query to the table
                    />
                    <PageSelector
                        //key={totalResults}
                        totalResults={totalResults}
                        onPageChange={handlePageChange}
                    />
                </div>
            ) : (
                <div class="content-area flex-1 p-4 text-gray-900 dark:text-gray-100">
                    <p>Pick a table to get started</p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
