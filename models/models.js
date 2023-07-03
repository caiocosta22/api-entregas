'use strict'

const pgpool = require('../config/pgconfig.js');
const sqlpool = require('../config/sqlconfig.js');

async function teste1(){
    try{
        await sqlpool.connect();
        console.log("Conexão bem sucedida com SQL SERVER");

        let ssql = `SELET TOP 1* FROM MOVIMENTO_DIA`;
        const resultsql = await sqlpool.request().query(ssql);
        console.log("Teste validado: ", resultsql.recordset);
    } catch{
        console.log("Erro na consulta");
    };
};

async function teste2(){
    try{
        const client = await pgpool.connect();
        console.log("Conexão bem sucedida com POSTGRES");

        const query = `SELEC * FROM TABLET_CARGAS2 LIMIT 1`;
        const resultsql = await client.query(query);
        console.log("Teste validado: ", resultsql.rows);
        client.release();
    } catch{
        console.log("Erro na consulta");
    }
};

module.exports = {teste1,teste2}