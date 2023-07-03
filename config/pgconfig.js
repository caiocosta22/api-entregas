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
/*
async function testarpostgres(){
try {
    // Cria a conexão com o banco de dados
    const client = await pgpool.connect();
    console.log('Conexão bem-sucedida!');
    const query = `SELECT * FROM SITE_PEDIDOS_FATURADOS WHERE IDG2 = 3631 LIMIT 1`
    const resultpg = await client.query(query);
    console.log("Teste: ", resultpg);
    
    // Fecha a conexão
    await pgpool.end();
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
  }
};
testarpostgres();
*/
module.exports = pgpool