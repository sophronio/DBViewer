const sqlKeywords = require('mssql').TYPES; // Use SQL keywords list from `mssql` package

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

module.exports = { validateAndTransformColumnName };
