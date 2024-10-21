// utils.js
import axios from 'axios';

export async function fetchData(
    tableName,
    limit,
    offset,
    setData,
    setTotalResults,
    setLoading,
    setError
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
        setData(response.data.rows);
        // setColumns(Object.keys(response.data.rows[0]));
        setTotalResults(response.data.totalCount);
        setLoading(false);
        setError(null);
    } catch (err) {
        setError(err.message);
        setLoading(false);
        setData([]);
    }
}

export function getPrimaryKey(columns) {
    const primaryKeyCandidate = columns.find(
        (key) =>
            key.toLowerCase().includes('id') || key.toLowerCase().includes('pk')
    );
    return primaryKeyCandidate || columns[0];
}
