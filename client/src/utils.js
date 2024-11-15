// utils.js
import axios from 'axios';

export async function fetchData(
    tableName,
    limit,
    offset,
    setRows,
    setColumns,
    onTotalResultsChange,
    setLoading,
    setError,
    originalRowsRef,
    searchQuery
) {
    try {
        if (
            searchQuery !== '' &&
            searchQuery !== undefined &&
            searchQuery !== null
        ) {
            const response = await axios.get(
                `http://localhost:8080/search/${tableName}`,
                {
                    params: {
                        query: searchQuery,
                        limit: limit,
                        offset: offset,
                    },
                }
            );
            setRows(response.data.rows);
            if (response.data.rows.length > 0)
                setColumns(Object.keys(response.data.rows[0]));
            onTotalResultsChange(response.data.totalCount);
            // } else if (originalRowsRef.current && originalRowsRef.current.length) {
            //     setRows(originalRowsRef.current);
            //     setColumns(Object.keys(originalRowsRef.current[0]));
        } else {
            const response = await axios.get(
                `http://localhost:8080/table/${tableName}`,
                {
                    params: {
                        limit: limit,
                        offset: offset,
                    },
                }
            );

            setRows(response.data.rows);
            setColumns(Object.keys(response.data.rows[0]));
            onTotalResultsChange(response.data.totalCount);
            originalRowsRef.current = response.data.rows;
        }
        setLoading(false);
        setError(null);
    } catch (err) {
        setError(err.message);
        setLoading(false);
        setRows([]);
    }
}

export function getPrimaryKey(columns) {
    const primaryKeyCandidate = columns.find(
        (key) =>
            key.toLowerCase().includes('id') || key.toLowerCase().includes('pk')
    );
    return primaryKeyCandidate || columns[0];
}

export async function fetchSqlTypes(setSqlTypes, setSizeOptions) {
    try {
        const response = await axios.get('http://localhost:8080/types');
        setSqlTypes(response.data.types);
        setSizeOptions(response.data.sizeOptions);
    } catch (error) {
        console.error('Error fetching SQL types:', error);
    }
}

export function getDefaultColumnValue(type) {
    switch (type) {
        case 'varchar':
        case 'nvarchar':
            return '';
        case 'decimal':
            return 0;
        case 'date':
            return new Date().toISOString().split('T')[0];
        default:
            return null;
    }
}
