const sqlKeywords = require('mssql').TYPES; // Use SQL keywords list from `mssql` package
const { poolPromise, mssql } = require('../config/dbConfig');
const allowedTables = [
    'Users',
    'Posts',
    'Comments',
    'Categories',
    'Post_Categories',
];
// const allowedTables = [
//     'CloudCost',
//     'AroEnvLookup',
//     'ServiceTypeLookup',
//     'Crosswalk',
// ];

// Helper function to validate and transform column names
function validateAndTransformColumnName(columnName) {
    // Convert camelCase to snake_case
    const snakeCaseName = columnName.replace(
        /[A-Z]/g,
        (letter) => `_${letter.toLowerCase()}`
    );

    // Check if the name is a reserved SQL keyword
    if (sqlKeywords.hasOwnProperty(snakeCaseName.toUpperCase())) {
        throw new Error(
            `Invalid column name: '${columnName}' is a reserved SQL keyword`
        );
    }

    // Ensure the name contains only alphanumeric characters and underscores
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(snakeCaseName)) {
        throw new Error(
            `Invalid column name: '${columnName}' contains invalid characters`
        );
    }

    return snakeCaseName;
}

// Helper function to validate the table name
const validateTableName = async (tableName) => {
    // Ensure the table name is in the allowed list (whitelist)
    if (!allowedTables.includes(tableName)) {
        throw new Error('Invalid table name');
    }

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

        if (result.recordset.length === 0) {
            throw new Error('Table not found in the database');
        }
        return true;
    } catch (err) {
        console.error('Error validating table name:', err.message);
    }
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

module.exports = {
    validateAndTransformColumnName,
    validateColumns,
    validateTableName,
};
