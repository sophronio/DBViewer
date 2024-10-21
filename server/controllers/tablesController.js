// controllers/tablesController.js
const { poolPromise, mssql } = require('../config/dbConfig');

const getTableNames = async (req, res) => {
    try {
        const pool = await poolPromise;
        const request = pool.request();

        const result = await request.query(`
            SELECT TABLE_NAME
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_TYPE = 'BASE TABLE'
        `);
        res.json(result.recordset.map((row) => row.TABLE_NAME));
    } catch (err) {
        res.status(500).send('Error fetching tables: ' + err.message);
    }
};

module.exports = { getTableNames };
