import React, { useState, useEffect, useRef } from 'react';

const PageSelector = ({ totalResults, onPageChange }) => {
    const [limit, setLimit] = useState(5); // default limit (results per page)
    const [page, setPage] = useState(1); // default page number
    const isMounted = useRef(totalResults);
    // Handle limit change
    const handleLimitChange = (e) => {
        const newLimit = parseInt(e.target.value, 10);
        setLimit(newLimit);
        // When the limit changes, reset to the first page
        onPageChange(newLimit, 0); // offset = 0 for the first page
        setPage(1); // reset to page 1
    };

    // Handle page number change
    const handlePageChange = (newPage) => {
        const offset = (newPage - 1) * limit;
        setPage(newPage);
        onPageChange(limit, offset);
    };

    // Calculate total number of pages
    const totalPages = Math.ceil(totalResults / limit);

    // set pages back when totalResults change, totalResults should only change when pulling new info
    useEffect(() => {
        if (totalResults !== 0 && totalResults !== isMounted.current) {
            isMounted.current = totalResults;
            setPage(1);
            setLimit(5);
        }
    }, [totalResults]);
    return (
        <div class="page-selector mt-1">
            <div class="relative mb-1">
                <label class="dark:text-gray-100" htmlFor="limit">
                    Results per page:{' '}
                </label>
                <select
                    class="dark:text-gray-100 dark:bg-gray-700 bg-gray-100 limit rounded"
                    value={limit}
                    onChange={handleLimitChange}
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                </select>
                <label class="dark:text-gray-100 float-right">
                    Total Results: {totalResults}
                </label>
            </div>

            <div>
                <button
                    class="dark:bg-gray-700 bg-gray-100 dark:text-gray-100 page-selector-btn px-1"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                >
                    Previous
                </button>

                <span class="dark:text-gray-100 page-number px-1">
                    Page {page} of {totalPages}
                </span>

                <button
                    class="dark:bg-gray-700 bg-gray-100 dark:text-gray-100 page-selector-btn px-1"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={totalPages === 0 || page === totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default PageSelector;
