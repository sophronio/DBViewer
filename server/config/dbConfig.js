const mssql = require('mssql');

const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    // port: 49758,
    options: {
        trustedConnection: true,
        enableArithAbort: true,
        trustServerCertificate: true,
        encrypt: false,
    },
};

const poolPromise = new mssql.ConnectionPool(config)
    .connect()
    .then((pool) => {
        console.log('Connected to the database.');
        return pool;
    })
    .catch((err) =>
        console.log('Database Connection Failed! Bad Config:', err)
    );
module.exports = {
    poolPromise,
    mssql,
};
