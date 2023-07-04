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
        let ssql = `SELECT * FROM V_Site_Cargas2`
        const resultsql = await sqlpool.request().query(ssql);
        const cargasSql = resultsql.recordset;
        
        //Conexão com o POSTGRES
        const client = await pgpool.connect();

        //Consulta pedidos no POSTGRES
        const query = `SELECT * FROM TABLET_CARGAS2 WHERE IDG2 = 2274`
        const resultpg = await client.query(query);
        console.log("Conexão com o POSTGRES sucedida")
        const cargaspg = resultpg.rows;

        /*//Inserção na tabela de Log
        const logsql = `INSERT INTO INTEGRACAO_API_ENTREGAS(DATASINCRONIZACAO_INICIO, tipo, descricao, status) values(getdate(), 1, 'integracao fv', '1')`
        await sqlpool.request().query(logsql);
        console.log("Log iniciado!");*/

        //Filtro de cargas
        const cargasFaltantes = cargasSql.filter(cargasql => !cargaspg.some(cargasql => cargaspg.cargaid === cargasSql.cargaid));
        console.log("Cargas dessincronizadas: ", cargasFaltantes.map(row => row.cargaid));

        //Inseção de pedidos no POSTGRES
        if(cargasFaltantes.length > 0){
            const valores = cargasFaltantes.map(row => `('${row.idg2}','${row.cargaid}','${row.data}','${row.status}','${row.placa}','${row.km_inicial}','${row.km_final}','${row.veiculoid}','${row.entidadeid_loja}','${row.obs}','${row.entregue}','${row.data_saida}','${row.data_retorno}','${row.nome_motorista}','${row.descricao}','${row.entidadeid_motorista}','${row.data_insercao_nuvem}','${row.data_fechamento_carga}','${row.status_sincronizacao}')`).join(',');
            const inserirdados = `INSERT INTO TABLET_CARGAS2(idg2,cargaid,data,status,placa,km_inicial,km_final,veiculoid,entidadeid_loja,obs,entregue,data_saida,data_retorno,nome_motorista,descricao,entidadeid_motorista,data_insercao_nuvem,data_fechamento_carga,status_sincronizacao) VALUES ${valores} `;
            // PK USADA CARGAS
            await client.query(inserirdados);
            console.log("Cargas sincronizadas");

            /*//Finalizando o registro no log
            const ultimologsql = `update INTEGRACAO_API_ENTREGAS set DATASINCRONIZACAO_FIM = getdate(), status = '2' where status = '1' and DATASINCRONIZACAO_FIM is null`;
            await sqlpool.request().query(ultimologsql);
            console.log("Log Finalizado"); */

            // const inserirpedidos = `INSERT INTO TABLET_CARGAS_PEDIDOS2(idg2,cargaid,entidadeid_loja,conta,ordem,numdocumento,motivonaoentregue,cli_razaosocial,endereco,complemento,bairro,cidade,uf,cep,numero,dt_emissao,volumes,entregue,entidadeid_cliente,data_insercao_nuvem,data_update_local,status_sincronizacao,alterado,latitude_checkin,longitude_checkin,cidade_checkin,estado_checkin,cep_checkin,rua_checkin,data_checkin,data_entrega,data_naoentregue,ocorrenciaid,canhoto,romaneioid,justificaatraso) VALUES ${valorespedidos};`
            // const valorespedidos = cargasPedidosFaltantes.map(row => `('${idg2}','${cargaid}','${entidadeid_loja}','${conta}','${ordem}','${numdocumento}','${motivonaoentregue}','${cli_razaosocial}','${endereco}','${complemento}','${bairro}','${cidade}','${uf}','${cep}','${numero}','${dt_emissao}','${volumes}','${entregue}','${entidadeid_cliente}','${data_insercao_nuvem}','${data_update_local}','${status_sincronizacao}','${alterado}','${latitude_checkin}','${longitude_checkin}','${cidade_checkin}','${estado_checkin}','${cep_checkin}','${rua_checkin}','${data_checkin}','${data_entrega}','${data_naoentregue}','${ocorrenciaid}','${canhoto}','${romaneioid}','${justificaatraso}')`).join(',');
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






