'use strict'
const { Pool } = require('pg');
const pgpool = new Pool({
    user: 'gprod',
    host: 'CLOUD64.P80.COM.BR',
    database: 'gpinformatica2',
    password: 'g2@9876@g2',
    port: '5432',
    max: 1000000,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
module.exports = pgpool