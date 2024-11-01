// controllers/typesController.js

const { poolPromise, mssql } = require('../config/dbConfig');

const getTypesFromDB = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.query(`
            SELECT name, max_length, precision, scale, is_nullable
            FROM sys.types
            ORDER BY name;
        `); // could add {WHERE is_user_defined = 0} clause for straight sql server types

        const types = result.recordset.map((type) => {
            return {
                name: type.name,
                maxLength: type.max_length,
                precision: type.precision,
                scale: type.scale,
                isNullable: type.is_nullable,
            };
        });

        res.json({
            types: types,
            sizeOptions: {
                binary: [1, 50, 100, 255, 8000],
                char: [1, 50, 100, 255, 8000],
                datetime2: [0, 1, 2, 3, 4, 5, 6, 7],
                datetimeoffset: [0, 1, 2, 3, 4, 5, 6, 7],
                decimal: [
                    ['Precision: ', 10, ', Scale: ', 2],
                    ['Precision: ', 18, ', Scale: ', 0],
                    ['Precision: ', 28, ', Scale: ', 6],
                    ['Precision: ', 38, ', Scale: ', 10],
                ],
                float: [
                    ['Precision: ', 24],
                    ['Precision: ', 53],
                ],
                nchar: [1, 50, 100, 255, 4000],
                numeric: [
                    ['Precision:', 10, ', Scale: ', 2],
                    ['Precision:', 18, ', Scale: ', 0],
                    ['Precision:', 28, ', Scale: ', 6],
                    ['Precision:', 38, ', Scale: ', 10],
                ],
                nvarchar: [1, 50, 100, 255, 4000, 'MAX'],
                time: [0, 1, 2, 3, 4, 5, 6, 7],
                varbinary: [1, 50, 100, 255, 8000, 'MAX'],
                varchar: [1, 50, 100, 255, 8000, 'MAX'],
            },
        });
    } catch (error) {
        res.status(500).send('Error fetching SQL types: ' + error.message);
    }
};

module.exports = { getTypesFromDB };
