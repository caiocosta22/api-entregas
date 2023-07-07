'use strict'

const pgpool = require('../config/pgconfig.js');
const sqlpool = require('../config/sqlconfig.js');

async function teste1(){
    try{
    // ----------------------------------------------------Aba de Pedidos-------------------------------------------------
        //Conexão com SQL SERVER
        await sqlpool.connect();
        console.log("Conexão com o SQL SERVER sucedida");    
        //Consulta pedidos no BD Local
            let ssql = `SELECT idg2
                ,cargaid
                ,entidadeid_loja
                ,conta
                ,ordem
                ,numdocumento
                ,cli_razaosocial
                ,endereco
                ,complemento
                ,bairro
                ,cidade
                ,uf
                ,cep
                ,numero
                ,dt_emissao
                ,volumes
                ,entidadeid_cliente
                ,latitude_checkin
                ,longitude_checkin
                ,ocorrenciaid
                ,romaneioid
                    FROM V_SITE_CARGASPEDIDOS2
                GROUP BY 
                idg2
                ,cargaid
                ,entidadeid_loja
                ,conta
                ,ordem
                ,numdocumento
                ,cli_razaosocial
                ,endereco
                ,complemento
                ,bairro
                ,cidade
                ,uf
                ,cep
                ,numero
                ,dt_emissao
                ,volumes
                ,entidadeid_cliente
                ,latitude_checkin
                ,longitude_checkin
                ,ocorrenciaid
                ,romaneioid`
            const resultsql = await sqlpool.request().query(ssql);
            const pedSql = resultsql.recordset;
            const idg2 = pedSql[1].idg2;
            //Conexão com o POSTGRES
            const client = await pgpool.connect();

            //Consulta pedidos no BD nuvem
            const query = {text: `SELECT * FROM TABLET_CARGAS_PEDIDOS2 WHERE IDG2 = $1`,
                            values: [idg2]}
            const resultpg = await client.query(query);
            const pedpg = resultpg.rows;

            //Filtro de pedidos
            const pedFaltantes = pedSql.filter(pedsql => !pedpg.some(pedsql => pedpg.conta === pedSql.conta));
            console.log("Pedidos não sincronizados: ", pedFaltantes.map(row => row.conta));

            //Inseção de pedidos no POSTGRES
            if (pedFaltantes.length > 0){
                
                const valoresped = pedFaltantes.map(row => `('${row.idg2}'
                ,'${row.cargaid}'
                ,'${row.entidadeid_loja}'
                ,'${row.conta}'
                ,'${row.ordem}'
                ,'${row.numdocumento}'
                ,'${row.clirazaosocial}'
                ,'${row.endereco}'
                ,'${row.complemento}'
                ,'${row.bairro}'
                ,'${row.cidade}'
                ,'${row.uf}'
                ,'${row.cep}'
                ,'${row.numero}'
                ,'${row.dt_emissao}'
                ,'${row.volumes}'
                ,'${row.entidadeid_cliente}'
                ,'${row.latitude_checkin}'
                ,'${row.longitude_checkin}'
                ,'${row.ocorrenciaid}'
                ,'${row.romaneioid}'
                )`).join(',');
                const inserirped = `INSERT INTO TABLET_CARGAS_PEDIDOS2(
                    idg2
                    ,cargaid
                    ,entidadeid_loja
                    ,conta
                    ,ordem
                    ,numdocumento
                    ,cli_razaosocial
                    ,endereco
                    ,complemento
                    ,bairro
                    ,cidade
                    ,uf
                    ,cep
                    ,numero
                    ,dt_emissao
                    ,volumes
                    ,entidadeid_cliente
                    ,latitude_checkin
                    ,longitude_checkin
                    ,ocorrenciaid
                    ,romaneioid) VALUES ${valoresped}`
                        // O ERRO TA AO EXECUTAR O INSERT
                await client.query(inserirped);
                console.log("Pedidos sincronizados");
            } else {
                console.log("Dados já estão atualizados")
            };
    } catch{
        console.log("Erro na consulta", err);
    };
};

async function teste2(){
    try{
        //Conexão com SQL SERVER
        await sqlpool.connect();
        console.log("Conexão com o SQL SERVER sucedida");
        //Consulta cargas no BD Local
        let ssql =`SELECT idg2
            ,cargaid
            ,data 
            ,status
            ,placa 
            ,km_inicial
            ,km_final 
            ,veiculoid
            ,entidadeid_loja
            ,obs
            ,nome_motorista
            ,descricao
            ,entidadeid_motorista
        FROM V_SITE_CARGAS2
        GROUP BY idg2
            ,cargaid
            ,data
            ,status
            ,placa
            ,km_inicial
            ,km_final
            ,veiculoid
            ,entidadeid_loja
            ,obs
            ,nome_motorista
            ,descricao
            ,entidadeid_motorista`
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
        console.log("Cargas não sincronizadas: ", cargasFaltantes.map(row => row.cargaid));
        //Inseção de cargas no POSTGRES
        if(cargasFaltantes.length > 0){
            const valores = cargasFaltantes.map(row => `('${row.idg2}'
            ,'${row.cargaid}'
            ,'${row.data}'
            ,'${row.status}'
            ,'${row.placa}'
            ,'${row.km_inicial}'
            ,'${row.km_final}'
            ,'${row.veiculoid}'
            ,'${row.entidadeid_loja}'
            ,'${row.obs}'
            ,'${row.nome_motorista}'
            ,'${row.descricao}'
            ,'${row.entidadeid_motorista}')`).join(',');
            const inserirdados = `INSERT INTO TABLET_CARGAS2(idg2
                ,cargaid
                ,data
                ,status
                ,placa
                ,km_inicial
                ,km_final
                ,veiculoid
                ,entidadeid_loja
                ,obs
                ,nome_motorista
                ,descricao
                ,entidadeid_motorista) VALUES ${valores} `;
            await client.query(inserirdados);
            console.log("Cargas sincronizadas");
            //Finalizando o registro no log
            /*const ultimologsql = `update INTEGRACAO_API_ENTREGAS set DATASINCRONIZACAO_FIM = getdate(), status = '2' where status = '1' and DATASINCRONIZACAO_FIM is null`;
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






