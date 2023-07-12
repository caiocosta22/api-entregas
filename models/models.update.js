'use strict'
const pgpool = require('../config/pgconfig.js');
const sqlpool = require('../config/sqlconfig.js');

async function updateped(){
    try{
        // Conexão com SQL SERVER
        await sqlpool.connect();
        console.log("Conexão com o SQL SERVER sucedida");
        // Conexão com o POSTGRES
        const client = await pgpool.connect();  
        // Consulta de pedidos alterados
        const query = `SELECT conta,
        cargaid,
        romaneioid,
        entidadeid_loja,
        coalesce(motivonaoentregue,'não informado') as motivonaoentregue,
        coalesce(entregue,'N')as entregue,
        to_char(current_date, 'YYYY-MM-DD') as data_update_local,
        coalesce(status_sincronizacao,1) as status_sincronizacao, 
        alterado,
        coalesce(latitude_checkin,'0') as latitude_checkin,
        coalesce(longitude_checkin,'0') as longitude_checkin,
        coalesce(cidade_checkin,'não informado') as cidade_checkin,
        coalesce(estado_checkin,'não informado') as estado_checkin,
        coalesce(cep_checkin,'não informado') as cep_checkin,
        coalesce(rua_checkin,'não informado') as rua_checkin,
        coalesce(justificativaatraso,'não informado') as justificativaatraso,
        data_checkin,
        data_entrega,
		data_naoentregue,
		coalesce(canhoto,'0') as canhoto
            FROM TABLET_CARGAS_PEDIDOS2
            WHERE ALTERADO = '1'
        AND IDG2 = 2274 
        AND DT_EMISSAO > (SELECT NOW() - INTERVAL '7 DAY') `;
        const resultquery = await client.query(query);
        const array = resultquery.rows;
        const tamanhoarray = resultquery.rowCount;
        //Inserção na tabela de Log
        const logsql = `INSERT INTO INTEGRACAO_API_ENTREGAS(DATASINCRONIZACAO_INICIO, tipo, descricao, status) values(getdate(), 1, 'UPDATE PEDIDOS', '1')`
        await sqlpool.request().query(logsql);
        console.log("Log iniciado!");
        //Tratativa para se não obter resultados no SELECT acima
        if (tamanhoarray<=0){
            const ultimologsql = `update INTEGRACAO_API_ENTREGAS set DATASINCRONIZACAO_FIM = getdate(), status = '2' where status = '1' and DATASINCRONIZACAO_FIM is null`;
            await sqlpool.request().query(ultimologsql);
            console.log("Log Finalizado");
            return console.log("Nenhum pedido para ser atualizado")
        };
        //Declaração 
        let x = 0;
        const conta = array[x].conta;
        const cargaid = array[x].cargaid;
        const romaneioid = array[x].romaneioid;
        const entidadeid_loja = array[x].entidadeid_loja
        const motivonaoentregue = array[x].motivonaoentregue
        const entregue = array[x].entregue
        const latitude_checkin = array[x].latitude_checkin
        const longitude_checkin = array[x].longitude_checkin
        const cidade_checkin = array[x].cidade_checkin
        const estado_checkin = array[x].estado_checkin
        const cep_checkin = array[x].cep_checkin
        const rua_checkin = array[x].rua_checkin
        const data_checkin = array[x].data_checkin
        const data_entrega = array[x].data_entrega
        const data_naoentregue = array[x].data_naoentregue
        const canhoto = array[x].canhoto
        const justificativaatraso = array[x].justificativaatraso          
        //Update na Base Local
        const update = `UPDATE CARGA_ROMANEIO_PED SET
        entregue = '${entregue}',
        motivonaoentregue = '${motivonaoentregue}',
        latitude = '${latitude_checkin}',
        longitude = '${longitude_checkin}',
        cidade = '${cidade_checkin}',
        estado = '${estado_checkin}',
        cep = '${cep_checkin}',
        rua = '${rua_checkin}',
        justificativaatraso = '${justificativaatraso}',
        data_checkin = CONVERT(datetime,${data_checkin}),
        data_entrega = CONVERT(datetime,${data_entrega}),
        data_nao_entregue = CONVERT(datetime,${data_naoentregue}),
        imagem_recibo = convert(varbinary(max),'${canhoto}')
        WHERE
        conta =  '${conta}'
        and cargaid = '${cargaid}'
        and romaneioid = '${romaneioid}'
        and entidadeid_loja = '${entidadeid_loja}'`;
        //Update na Base da Nuvem
        const updatealterado =` 
        UPDATE TABLET_CARGAS_PEDIDOS2 SET alterado = '2'
        WHERE
        conta =  '${conta}'
        and cargaid = '${cargaid}'
        and romaneioid = '${romaneioid}'
        and entidadeid_loja = '${entidadeid_loja}'`;
        //Laço para aplicar os Updates
        for (x=0; x<tamanhoarray; x++){
            //Execução no banco local
            await sqlpool.request().query(update).then((result) => {
                console.log("Update no banco LOCAL feito com sucesso");
                return result
            }).catch((err) => {
                console.log("Falha no update ", err)
                throw err
            });
            //Execução no banco nuvem
            await client.query(updatealterado).then((result) => {
                console.log("Update no banco NUVEM feito com sucesso");
                return result
            }).catch((err) => {
                console.log("Falha no update ", err)
                throw err
            });
        }; 
        //Finalizando o registro no log
        const ultimologsql = `update INTEGRACAO_API_ENTREGAS set DATASINCRONIZACAO_FIM = getdate(), status = '2' where status = '1' and DATASINCRONIZACAO_FIM is null`;
        await sqlpool.request().query(ultimologsql);
        console.log("Log Finalizado"); 
        client.release();
        sqlpool.close();
    } catch {
        console.log("Erro na atualização de pedidos ", err);
        const logsql = `INSERT INTO INTEGRACAO_API_ENTREGAS(DATASINCRONIZACAO_INICIO, tipo, descricao, status) values(getdate(), 1, 'UPDATE PEDIDOS FALHOU', '3')`
        await sqlpool.request().query(logsql);
        console.log("Log Finalizado com erro");
    };
};
module.exports = {updateped};