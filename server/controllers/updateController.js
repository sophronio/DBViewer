// controllers/updateController.js
const { poolPromise, mssql } = require('../config/dbConfig');
const allowedTables = ['Users', 'Activities', 'Records', 'Profile'];

// // Infers the SQL data type based on the JavaScript value type
// const inferSQLType = (value) => {
//     if (typeof value === 'number' && Number.isInteger(value)) {
//         return mssql.Int;
//     } else if (typeof value === 'number') {
//         return mssql.Float;
//     } else if (typeof value === 'boolean') {
//         return mssql.Bit;
//     } else if (value instanceof Date) {
//         return mssql.DateTime;
//     } else {
//         return mssql.NVarChar; // Default to string
//     }
// };

// Helper function to validate the table name
const validateTableName = async (tableName) => {
    // Ensure the table name is in the allowed list (whitelist)
    if (!allowedTables.includes(tableName)) {
        throw new Error('Invalid table name');
    }

    // Optionally, add a database-level validation if the whitelist is dynamic
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.input('tableName', mssql.NVarChar, tableName)
        .query(`
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_NAME = @tableName
    `);

    if (result.recordset.length === 0) {
        throw new Error('Table not found in the database');
    }
    return true;
};

// Helper function to validate columns against the given table
const validateColumns = async (tableName, columns) => {
    const pool = await poolPromise;
    const request = pool.request();

    // Get the column names for the provided table
    const result = await request.input('tableName', mssql.NVarChar, tableName)
        .query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = @tableName
    `);

    const validColumns = result.recordset.map((col) => col.COLUMN_NAME);

    // Ensure all provided columns exist in the table's schema
    const invalidColumns = columns.filter((col) => !validColumns.includes(col));

    if (invalidColumns.length > 0) {
        throw new Error(`Invalid columns: ${invalidColumns.join(', ')}`);
    }
    return true;
};

// Controller function for sending updates
const sendUpdates = async (req, res) => {
    const { tableName, data, primaryKey, primaryKeyValue } = req.body;

    if (
        !tableName ||
        !primaryKey ||
        !data ||
        typeof data !== 'object' ||
        !primaryKeyValue
    ) {
        return res
            .status(400)
            .send(
                'Table name, primaryKey, primarKeyValue, and data are required.'
            );
    }

    try {
        // Step 1: Check if the table name is valid.
        await validateTableName(tableName);

        // Step 2: Get columns and values from data object
        const columns = Object.keys(data);
        const values = Object.values(data);

        // Step 3: Validate if the columns exist in the table
        await validateColumns(tableName, columns);

        // Step 4: Construct the query dynamically
        const setClauses = columns
            .map((col, idx) => `${col} = @value${idx}`)
            .join(', ');

        // Step 5: Execute the update query using the primary key for targeting the row
        const pool = await poolPromise;
        const request = pool.request();
        // Bind the column values to the query to prevent SQL injection
        columns.forEach((col, idx) => {
            request.input(`value${idx}`, mssql.NVarChar, values[idx]); // Dynamically bind values based on column types
        });

        request.input('primaryKeyValue', mssql.Int, primaryKeyValue); // Primary key value
        console.log(
            'tableName:',
            tableName,
            'setClauses:',
            setClauses,
            'primaryKey:',
            primaryKey
        );
        const query = `
              UPDATE ${tableName}
              SET ${setClauses}
              WHERE ${primaryKey} = @primaryKeyValue
          `;
        console.log();
        await request.query(query);

        // Step 6: Send success response
        res.status(200).json({
            message: `Update successful for table: ${tableName}`,
        });
    } catch (error) {
        // Step 7: Handle errors gracefully
        console.error('Error updating record:', error.message);
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    sendUpdates,
};
