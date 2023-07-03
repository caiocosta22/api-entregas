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
        //Conexão com SQL SERVER
        await sqlpool.connect();
        console.log("Conexão com o SQL SERVER sucedida");
        
        //Consulta cargas no BD Local
        let ssql = `SELECT TOP 10 * FROM V_Site_Cargas2`
        const resultsql = await sqlpool.request().query(ssql);
        const contasSql = resultsql.recordset;
        
        //Conexão com o POSTGRES
        const client = await pgpool.connect();

        //Consulta pedidos no POSTGRES
        const query = `SELECT * FROM TABLET_CARGAS WHERE IDG2 = 2274`
        const resultpg = await client.query(query);
        const contaspg = resultpg.rows;

        /*//Inserção na tabela de Log
        const logsql = `INSERT INTO INTEGRACAO_API_ENTREGAS(DATASINCRONIZACAO_INICIO, tipo, descricao, status) values(getdate(), 1, 'integracao fv', '1')`
        await sqlpool.request().query(logsql);
        console.log("Log iniciado!");*/

        //Filtro de contas
        const cargasFaltantes = cargasSql.filter(cargasql => !cargaspg.some(cargasql => cargaspg.carga === cargasSql.carga));
        console.log("Pedidos dessincronizados: ", cargasFaltantes.map(row => row.carga));

        //Inseção de pedidos no POSTGRES
        if(contasFaltantes.length > 0){
            const valores = cargasFaltantes.map(row => `('${row.idg2}','${row.conta}','${row.entidadeid_loja}','${row.numpedido}','${row.dataemissao}','${row.entidadeid_func}','${row.entidadeid_cliente}','${row.totalprodutos}','${row.totalnota}','${row.descontos}','${row.num_nota}','${row.condicaoid}','${row.formapagid}','${row.prazo}','${row.obs}')`).join(',');
            const inserirdados = `INSERT INTO SITE_PEDIDOS_FATURADOS(idg2,conta,entidadeid_loja,numpedido,dataemissao,entidadeid_func,entidadeid_cliente,totalprodutos,totalnota,descontos,num_nota,condicaoid,formapagid,prazo,obs) VALUES ${valores} `;

            await client.query(inserirdados);
            console.log("Cargas sincronizadas");

            /*//Finalizando o registro no log
            const ultimologsql = `update INTEGRACAO_API_ENTREGAS set DATASINCRONIZACAO_FIM = getdate(), status = '2' where status = '1' and DATASINCRONIZACAO_FIM is null`;
            await sqlpool.request().query(ultimologsql);
            console.log("Log Finalizado"); */
        } else{
                console.log("Dados já estão atualizados");
                // Finalizando o registro no Log
                // const ultimologsql = `update INTEGRACAO_API_ENTREGAS set DATASINCRONIZACAO_FIM = getdate(), status = '2' where status = '1' and DATASINCRONIZACAO_FIM is null`;
                // await sqlpool.request().query(ultimologsql);
                // console.log("Log Finalizado"); 
                };
        //Finalizando conxões com os BD
        client.release();
        sqlpool.close();
    } catch(err){
        console.error('Erro com a sincronização ', err);
        // Inserção na tabela de Log
        // const logsql = `INSERT INTO INTEGRACAO_API_ENTREGAS(DATASINCRONIZACAO_INICIO,DATASINCRONIZACAO_FIM, tipo, descricao, status) values(getdate(),getdate(), 1, 'integracao fv', '3')`
        // await sqlpool.request().query(logsql)
        // console.log("Log iniciado!")
    };
};        

module.exports = {teste1,teste2}