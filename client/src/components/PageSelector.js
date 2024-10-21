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
        <div class="page-selector">
            <div>
                <label htmlFor="limit">Results per page: </label>
                <select id="limit" value={limit} onChange={handleLimitChange}>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                </select>
            </div>

            <div>
                <button
                    class="page-selector-btn pr-1"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                >
                    Previous
                </button>

                <span class="page-number">
                    Page {page} of {totalPages}
                </span>

                <button
                    class="page-selector-btn pl-1"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default PageSelector;
