'use strict'
const pgpool = require('../config/pgconfig.js');
const sqlpool = require('../config/sqlconfig.js');

async function inserecargas(){
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
        const linhasSql = resultsql.rowsAffected
        if (linhasSql<=0) {
            const ultimologsql = `update INTEGRACAO_API_ENTREGAS set DATASINCRONIZACAO_FIM = getdate(), status = '2' where status = '1' and DATASINCRONIZACAO_FIM is null`;
            await sqlpool.request().query(ultimologsql);
            console.log("Log Finalizado");
            return console.log("Nenhuma carga para ser inserida")
        };
        const idg2 = cargasSql[0].idg2;
        //Conexão com o POSTGRES
        const client = await pgpool.connect();
        //Consulta pedidos no POSTGRES
        const query = {text:`SELECT * FROM TABLET_CARGAS2 WHERE IDG2 = $1`,
                        values: [idg2]}
        const resultpg = await client.query(query);
        console.log("Conexão com o POSTGRES sucedida")
        const cargaspg = resultpg.rows;
        //Inserção na tabela de Log
        const logsql = `INSERT INTO INTEGRACAO_API_ENTREGAS(DATASINCRONIZACAO_INICIO, tipo, descricao, status) values(getdate(), 1, 'SINCRONIZACAO CARGAS', '1')`
        await sqlpool.request().query(logsql);
        console.log("Log iniciado!");
        //Filtro de cargas
        const cargasFaltantes = cargasSql.filter(cargasql => !cargaspg.some(cargaspg => cargaspg.cargaid === cargasql.cargaid && cargaspg.entidadeid_motorista === cargasql.entidadeid_motorista));
        console.log("Cargas não sincronizadas: ", cargasFaltantes.map(row => row.cargaid));
        //Inserção de cargas no POSTGRES
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
                ,entidadeid_motorista) VALUES ${valores}`;
            await client.query(inserirdados);
            console.log("Cargas sincronizadas");
            //Finalizando o registro no log
            const ultimologsql = `update INTEGRACAO_API_ENTREGAS set DATASINCRONIZACAO_FIM = getdate(), status = '2' where status = '1' and DATASINCRONIZACAO_FIM is null`;
            await sqlpool.request().query(ultimologsql);
            console.log("Log Finalizado"); 
        } else{
                console.log("Dados já estão atualizados");
                // Finalizando o registro no Log
                const ultimologsql = `update INTEGRACAO_API_ENTREGAS set DATASINCRONIZACAO_FIM = getdate(), status = '2' where status = '1' and DATASINCRONIZACAO_FIM is null`;
                await sqlpool.request().query(ultimologsql);
                console.log("Log Finalizado"); 
                };
        //Finalizando conexões com os BD
        client.release();
        sqlpool.close();
    } catch(err){
        console.error('Erro na sincronização ', err);
        // Inserção na tabela de Log
         const logsql = `INSERT INTO INTEGRACAO_API_ENTREGAS(DATASINCRONIZACAO_INICIO,DATASINCRONIZACAO_FIM, tipo, descricao, status) values(getdate(),getdate(), 1, 'SINCRONIZACAO CARGAS', '3')`
         await sqlpool.request().query(logsql)
         console.log("Log finalizado com erro!")
    };
};        

async function insereped(){
    try{
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
                ,alterado
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
                ,alterado
                ,latitude_checkin
                ,longitude_checkin
                ,ocorrenciaid
                ,romaneioid`
            const resultsql = await sqlpool.request().query(ssql);
            const pedSql = resultsql.recordset;
            const linhasSql = resultsql.rowsAffected;
            //Tratativa para se não houver pedidos no select acima
            if (linhasSql<=0) {
                const ultimologsql = `update INTEGRACAO_API_ENTREGAS set DATASINCRONIZACAO_FIM = getdate(), status = '2' where status = '1' and DATASINCRONIZACAO_FIM is null`;
                await sqlpool.request().query(ultimologsql);
                console.log("Log Finalizado");
                return console.log("Nenhuma pedido para ser inserido")
            };
            //Consulta pedidos no BD nuvem
            const client = await pgpool.connect();
            const idg2 = pedSql[0].idg2;
            const query = {text: `SELECT * FROM TABLET_CARGAS_PEDIDOS2 WHERE IDG2 = $1`,
                            values: [idg2]};
            const resultpg = await client.query(query);
            const pedpg = resultpg.rows;
            //Inserção na tabela de Log
            const logsql = `INSERT INTO INTEGRACAO_API_ENTREGAS(DATASINCRONIZACAO_INICIO, tipo, descricao, status) values(getdate(), 1, 'SINCRONIZACAO CARGAS', '1')`
            await sqlpool.request().query(logsql);
            console.log("Log iniciado!");
            //Filtro de pedidos
            const pedFaltantes = pedSql.filter(pedsql => !pedpg.some(pedpg => pedpg.conta === pedsql.conta && pedpg.entidadeid_loja === pedsql.entidadeid_loja));
            const contasped = pedFaltantes.map(row => row.conta);
            console.log("Pedidos não sincronizados: ", contasped);
            //Inseção de pedidos no POSTGRES
            if (pedFaltantes.length > 0){
                //Consulta dos canhotos
                const queryimagem = `SELECT isnull(IMAGEM_RECIBO,0) FROM CARGA_ROMANEIO_PED WHERE CONTA in(${contasped})`
                const resultimagemsql = await sqlpool.request().query(queryimagem);
                const imagemsql = resultimagemsql.recordsets;
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
                ,'${row.alterado}'
                ,'${row.latitude_checkin}'
                ,'${row.longitude_checkin}'
                ,'${row.ocorrenciaid}'
                ,'${imagemsql}'
                ,'${row.romaneioid}')`
                ).join(',');
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
                ,alterado
                ,latitude_checkin
                ,longitude_checkin
                ,ocorrenciaid
                ,canhoto
                ,romaneioid)
                    VALUES ${valoresped}`
                await client.query(inserirped);
                console.log("Pedidos sincronizados");
                //Finalizando o registro no log
                const ultimologsql = `update INTEGRACAO_API_ENTREGAS set DATASINCRONIZACAO_FIM = getdate(), status = '2' where status = '1' and DATASINCRONIZACAO_FIM is null`;
                await sqlpool.request().query(ultimologsql);
                console.log("Log Finalizado"); 
            } else {
                console.log("Dados já estão atualizados")
                //Finalizando o registro no log
                const ultimologsql = `update INTEGRACAO_API_ENTREGAS set DATASINCRONIZACAO_FIM = getdate(), status = '2' where status = '1' and DATASINCRONIZACAO_FIM is null`;
                await sqlpool.request().query(ultimologsql);
                console.log("Log Finalizado"); 
            };
            client.release();
            sqlpool.close();
    } catch{
        console.log("Erro na sincronização ", err);
        //Finalizando Log com erro
        const logsql = `INSERT INTO INTEGRACAO_API_ENTREGAS(DATASINCRONIZACAO_INICIO,DATASINCRONIZACAO_FIM, tipo, descricao, status) values(getdate(),getdate(), 1, 'SINCRONIZACAO CARGAS', '3')`
        await sqlpool.request().query(logsql)
        console.log("Log finalizado com erro!")
        sqlpool.close();
    };
};

module.exports = {inserecargas,insereped}






