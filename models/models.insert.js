'use strict'
const pgpool = require('../config/pgconfig.js');
const sqlpool = require('../config/sqlconfig.js');

//Função Cargas
async function inserecargas(err){
    //Client de conexão com o postgres
    const client = await pgpool.connect();

    //Começo da sincronização
    try{
        //Conexão com SQL SERVER
        await sqlpool.connect();
       
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
            return console.log("Nenhuma carga para ser inserida")
        };
        
        //Consulta pedidos no POSTGRES
        const idg2 = cargasSql[0].idg2;
        const query = {text:`SELECT * FROM TABLET_CARGAS2 WHERE IDG2 = $1`,
                        values: [idg2]};
        const resultpg = await client.query(query);
        const cargaspg = resultpg.rows;
     
        //Registro Log Cargas
        const logsql = `INSERT INTO INTEGRACAO_API_ENTREGAS(DATASINCRONIZACAO_INICIO, tipo, descricao, status)
        values(getdate(), 1, 'SINCRONIZACAO CARGAS', '1')`
        await sqlpool.request().query(logsql);
       
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
                ,entidadeid_motorista) 
            VALUES ${valores}`;
            
            await client.query(inserirdados);
            console.log("Cargas sincronizadas");
           
            //Finalizando o registro no log
            const ultimologsql = `update INTEGRACAO_API_ENTREGAS set DATASINCRONIZACAO_FIM = getdate(), status = '2'
            where status = '1' and DATASINCRONIZACAO_FIM is null`;
            await sqlpool.request().query(ultimologsql);
            console.log("Log Finalizado"); 

        } else{
                console.log("Dados já estão atualizados");
                // Finalizando o registro no Log
                const ultimologsql = `update INTEGRACAO_API_ENTREGAS set DATASINCRONIZACAO_FIM = getdate(), status = '2' 
                where status = '1' and DATASINCRONIZACAO_FIM is null`;
                await sqlpool.request().query(ultimologsql);
                }

    } catch(error){
		console.error('Erro na sincronização ', error);
        // Inserção na tabela de Log
         const logsql = `INSERT INTO INTEGRACAO_API_ENTREGAS(DATASINCRONIZACAO_INICIO,DATASINCRONIZACAO_FIM, tipo, descricao, status) values(getdate(),getdate(), 1, 'SINCRONIZACAO CARGAS', '3')`;
         await sqlpool.request().query(logsql);
    } finally {
        //Finalizando conexões com os BD
        await client.end();
        console.log("Conexão com POSTGRES finalizada");
        await sqlpool.close();
        console.log("Conexão com o SQL SERVER finalizada");
    }
};        

//Função Pedidos
async function insereped(err){
    //Client de conexão com o postgres
    const client = await pgpool.connect();
    
    //Começo da sincronização
    try{
        //Conexão com SQL SERVER
        await sqlpool.connect();  
        
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
                ,entregue
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
                ,romaneioid
                ,entregue`
            const resultsql = await sqlpool.request().query(ssql);
            const pedSql = resultsql.recordset;
            const linhasSql = resultsql.rowsAffected;

            //Tratativa para se não houver pedidos no select acima
            if (linhasSql == 0) {
                const ultimologsql = `update INTEGRACAO_API_ENTREGAS set DATASINCRONIZACAO_FIM = getdate(), status = '2' where status = '1' and DATASINCRONIZACAO_FIM is null`;
                await sqlpool.request().query(ultimologsql);
                return console.log("Nenhum pedido para ser inserido")
            };
 
            //Inserção na tabela de Log
            const logsql = `INSERT INTO INTEGRACAO_API_ENTREGAS(DATASINCRONIZACAO_INICIO, tipo, descricao, status) 
            values(getdate(), 1,'SINCRONIZACAO PEDIDOS', '1')`
            await sqlpool.request().query(logsql);
                       
            //Consulta pedidos no BD nuvem
            const idg2 = pedSql[0].idg2;
            const loja = pedSql[0].entidadeid_loja;
            const registroscontas = resultsql.recordset.map(row=>row.conta).join(',')
            const registroscargas = resultsql.recordset.map(row=>row.cargaid).join(',')
            
            const query = `SELECT * FROM TABLET_CARGAS_PEDIDOS2
            WHERE IDG2 = ${idg2}
			AND CONTA IN (${registroscontas})
            AND CARGAID IN (${registroscargas})
            AND ENTIDADEID_LOJA = '${loja}'`

            //Resultados da query
            const resultpg = await client.query(query);
            const pedpg = resultpg.rows;
            
            //Filtro de pedidos
            const pedFaltantes = pedSql.filter(pedsql => !pedpg.some(pedpg => pedpg.conta === pedsql.conta && pedsql.cargaid === pedpg.cargaid));
            const contasped = pedFaltantes.map(row => row.conta);
            console.log("Pedidos não sincronizados: ", contasped);
            
            //Inseção de pedidos no POSTGRES
            if (pedFaltantes.length > 0){
                const valoresped = pedFaltantes.map(row => `('${row.idg2}'
                ,'${row.cargaid}'
                ,'${row.entidadeid_loja}'
                ,'${row.conta}'
                ,'${row.ordem}'
                ,'${row.numdocumento}'
                ,'${row.cli_razaosocial}'
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
                ,'${row.romaneioid}'
                ,'${row.entregue}')`).join(',');
                
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
                ,romaneioid
                ,entregue)
                VALUES ${valoresped}`
                
                await client.query(inserirped);
                console.log("Pedidos sincronizados");
                
                //Finalizando o registro no log
                const ultimologsql = `update INTEGRACAO_API_ENTREGAS set DATASINCRONIZACAO_FIM = getdate(), status = '2' where status = '1' and DATASINCRONIZACAO_FIM is null`;
                await sqlpool.request().query(ultimologsql);
            } else {
                console.log("Dados já estão atualizados")                
                //Finalizando o registro no log
                const ultimologsql = `update INTEGRACAO_API_ENTREGAS set DATASINCRONIZACAO_FIM = getdate(), status = '2' where status = '1' and DATASINCRONIZACAO_FIM is null`;
                await sqlpool.request().query(ultimologsql);
            };

    } catch(error){
        console.log("Erro na sincronização ", error);
        const logsql = `INSERT INTO INTEGRACAO_API_ENTREGAS(DATASINCRONIZACAO_INICIO,DATASINCRONIZACAO_FIM, tipo, descricao, status) values(getdate(),getdate(), 1, 'SINCRONIZACAO CARGAS', '3')`
        await sqlpool.request().query(logsql)
        sqlpool.close();
    } finally {
        //Finalizando as conexões com o banco de dados
        await client.end();
        console.log("Conexão com POSTGRES finalizada")
        await sqlpool.close();
        console.log("Conexão com o SQL SERVER finalizada");  
    }
};

module.exports = {inserecargas,insereped}






