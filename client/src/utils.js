// utils.js
import axios from 'axios';

export async function fetchData(
    tableName,
    limit,
    offset,
    setRows,
    setColumns,
    setTotalResults,
    setLoading,
    setError,
    originalRowsRef
) {
    try {
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
        setTotalResults(response.data.totalCount);
        setLoading(false);
        setError(null);
        originalRowsRef.current = response.data.rows;
        console.log(originalRowsRef.current);
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
        console.log(response.data.types);
        console.log(response.data.sizeOptions);
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
