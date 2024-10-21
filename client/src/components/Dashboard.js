import React, { useState } from 'react';
import Sidebar from './Sidebar';
import InteractiveTable from './InteractiveTable';
import PageSelector from './PageSelector';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const [activeComponent, setActiveComponent] = useState('');
    const [limit, setLimit] = useState(10);
    const [offset, setOffset] = useState(0);
    const [totalResults, setTotalResults] = useState(0);

    // Handle component change from sidebar clicks
    const handleComponentChange = (componentName) => {
        setActiveComponent(componentName);
        setLimit(5);
        setOffset(0);
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
    return (
        <div className="dashboard-container flex">
            <Sidebar onComponentChange={handleComponentChange} />

            {activeComponent !== '' ? (
                <div className="content-area flex-1 p-4">
                    <InteractiveTable
                        key={limit + offset}
                        tableName={activeComponent}
                        onTotalResultsChange={handleTotalResults}
                        limit={limit}
                        offset={offset}
                    />
                    <PageSelector
                        //key={totalResults}
                        totalResults={totalResults}
                        onPageChange={handlePageChange}
                    />
                </div>
            ) : (
                <div className="content-area flex-1 p-4">
                    <p>Pick a table to get started</p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
