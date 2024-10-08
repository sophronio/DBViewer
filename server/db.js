const sql = require('mssql');

const config = {
    server: 'BEIJUNS-XPS15',
    database: 'testing',
    user: 'admin_tutorial',
    password: 'Password!',
    options: {
        trustedConnection: true,
        enableArithAbort: true,
        trustServerCertificate: true,
        encrypt: false,
    },
};

module.exports = {
    connect: () => sql.connect(config),
    sql,
}