const { poolPromise, mssql } = require('../config/dbConfig');
const { validateTableName, validateColumns } = require('./utils');

const addRow = async (req, res) => {
    const { tableName, columns, values } = req.body;
    if (!tableName || !columns || !values) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    try {
        await validateTableName(tableName);

        await validateColumns(tableName, columns);

        const columnList = columns.join(', ');
        const valuePlaceholders = columns
            .map((_, index) => `@value${index}`)
            .join(', ');
        const insertQuery = `INSERT INTO ${tableName} (${columnList}) VALUES (${valuePlaceholders})`;

        const pool = await poolPromise;
        const request = pool.request();

        values.forEach((value, index) => {
            request.input(`value${index}`, value);
        });

        await request.query(insertQuery);
        // Send success response
        res.status(200).json({
            message: 'Row inserted successfully',
        });
    } catch (error) {
        console.error('Error adding row:', error.message);
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    addRow,
};
