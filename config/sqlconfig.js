'use strict'
const sql = require('mssql');
const connect = {
    user: 'gpvendas',
    password: 'gpinfo',
    database: 'GPVENDAS', 
    server: '192.168.0.250',
    pool: {
        max: 1000000,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: false // para microsoft azure
    }
};
const sqlpool = new sql.ConnectionPool(connect);

module.exports = sqlpool