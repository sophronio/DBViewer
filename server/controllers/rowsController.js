// controllers/rowsController.js
const { poolPromise, mssql } = require('../config/dbConfig');
// Function to validate table names against the database
const validateTableName = async (tableName) => {
    try {
        const pool = await poolPromise;
        const request = pool.request();

        // Using .input() to bind the tableName parameter
        request.input('tableName', mssql.NVarChar, tableName);

        const result = await request.query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_NAME = @tableName;
      `);

        return result.recordset.length > 0; // Return true if the table exists, false otherwise
    } catch (err) {
        console.error('Error validating table name:', err.message);
        return false;
    }
};
const getRowsFromTable = async (req, res) => {
    const { tableName } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    try {
        // Validate the table name
        const isValidTable = await validateTableName(tableName);
        if (!isValidTable) {
            return res.status(400).send(`Invalid table name: ${tableName}`);
        }

        // Step 1: Get the primary key column(s) for the table using a parameterized query
        const pool = await poolPromise; // Use the connection pool
        const request = pool.request(); // Create a new request using the pool
        request.input('tableName', mssql.NVarChar, tableName);

        const primaryKeyResult = await request.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_NAME = @tableName 
        AND OBJECTPROPERTY(OBJECT_ID(CONSTRAINT_SCHEMA + '.' + CONSTRAINT_NAME), 'IsPrimaryKey') = 1;
      `);

        if (primaryKeyResult.recordset.length === 0) {
            return res
                .status(400)
                .send(`No primary key found for table: ${tableName}`);
        }

        const primaryKey = primaryKeyResult.recordset[0].COLUMN_NAME;

        // Step 2: Get the total number of rows in the table
        const totalCountResult = await request.query(`
        SELECT COUNT(*) as totalCount 
        FROM ${tableName};
      `);

        const totalCount = totalCountResult.recordset[0].totalCount;

        // Step 3: Fetch paginated rows, ordered by the primary key using parameterized queries
        request.input('limit', mssql.Int, limit);
        request.input('offset', mssql.Int, offset);

        const rowsResult = await request.query(`
        SELECT * 
        FROM ${tableName}
        ORDER BY ${primaryKey} 
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY;
      `);

        res.json({
            rows: rowsResult.recordset,
            totalCount,
        });
    } catch (err) {
        console.error('Error fetching rows:', err.message);
        res.status(500).send('Error fetching rows: ' + err.message);
    }
};

module.exports = { getRowsFromTable };
