'use strict'

const sql = require('mssql');
const connect = {
    user: 'gpvendas',
    password: 'gpinfo',
    database: 'API_ENTREGAS', 
    server: 'G2SERVER',
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
/*
// Função para testar a conexão com o banco de dados
async function testarConexao() {
    try {
      // Cria a conexão com o banco de dados
      await sqlpool.connect(); 
      console.log('Conexão bem-sucedida!');
      let ssql = `SELECT TOP 1 * FROM MOVIMENTO_DIA`
      const result = await sqlpool.request().query(ssql)
      console.log("Teste: ", result.recordset)

      // Fecha a conexão
      await sqlpool.close();
    } catch (error) {
      console.error('Erro ao conectar ao banco de dados:', error);
    }
  };
  // Chama a função para testar a conexão
  testarConexao();
*/
module.exports = sqlpool