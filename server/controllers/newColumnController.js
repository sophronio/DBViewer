const { poolPromise, mssql } = require('../config/dbConfig');
const { validateAndTransformColumnName } = require('./utils');
// Infers the SQL data type based on the type in request body
// const inferSQLType = (type) => {
//     if (type === 'integer') {
//         return mssql.Int;
//     } else if (type === 'float') {
//         return mssql.Float;
//     } else if (type === 'boolean') {
//         return mssql.Bit;
//     } else if (type === 'date') {
//         return mssql.DateTime;
//     } else {
//         return mssql.NVarChar; // Default to string
//     }
// };

const addColumn = async (req, res) => {
    const { tableName, columnName, columnType, columnSize } = req.body;
    if (!tableName || !columnName || !columnType) {
        return res.status(400).send('Invalid column data');
    }
    try {
        const pool = await poolPromise;
        const validColumnName = validateAndTransformColumnName(columnName);
        let columnDefinition = `${validColumnName} ${columnType}`;
        // Add size if necessary
        if (
            columnSize &&
            columnSize.includes('Precision') &&
            columnSize.includes('Scale')
        ) {
            const sizeArray = columnSize.split(',');
            columnDefinition += `(${parseInt(sizeArray[1])}, ${parseInt(sizeArray[4])})`;
        } else if (columnSize && columnSize.includes('Precision')) {
            const sizeArray = columnSize.split(',');
            columnDefinition += `(${parseInt(sizeArray[1])})`;
        } else if (columnSize && columnSize !== 'MAX') {
            columnDefinition += `(${columnSize})`;
        } else if (columnSize === 'MAX') {
            columnDefinition += '(MAX)';
        }
        await pool.query(`ALTER TABLE ${tableName} ADD ${columnDefinition}`);

        res.send(
            `Column ${validColumnName} of type ${columnType} added successfully`
        );
    } catch (error) {
        console.error('Error adding new column:', error);
        res.status(500).send('Error adding new column');
    }
};

module.exports = {
    addColumn,
};
