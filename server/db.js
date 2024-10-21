// config/dbConfig.js
const mssql = require('mssql');

const dbConfig = {
    server: 'BEIJUNS-XPS15',
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        encrypt: false, // Use this if you're on Azure SQL
        trustServerCertificate: true, // Use this if you're on a local SQL Server
        trustedConnection: true,
        enableArithAbort: true,
    },
};

const connectDB = async () => {
    try {
        await mssql.connect(dbConfig);
        console.log('Connected to the database.');
    } catch (err) {
        console.error('Database connection failed:', err.message);
        process.exit(1); // Exit if the connection fails
    }
};

module.exports = { connectDB };
