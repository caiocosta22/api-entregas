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
        coalesce(cidade_checkin,'') as cidade_checkin,
        coalesce(estado_checkin,'') as estado_checkin,
        coalesce(cep_checkin,'') as cep_checkin,
        coalesce(rua_checkin,'') as rua_checkin,
        coalesce(justificativaatraso,'não informado') as justificativaatraso,
        data_checkin,
        data_entrega,
		data_naoentregue,
		coalesce(canhoto,'0') as canhoto
            FROM TABLET_CARGAS_PEDIDOS2
            WHERE ALTERADO = '1'
        AND IDG2 = 2274 `;
        //AND DT_EMISSAO > (SELECT NOW() - INTERVAL '7 DAY') 
        const resultquery = await client.query(query);
        const array = resultquery.rows;
        const tamanhoarray = resultquery.rowCount;
        
        let x = 0;
        const conta = array[x].conta;
        const cargaid = array[x].cargaid;
        const romaneioid = array[x].romaneioid;
        const entidadeid_loja = array[x].entidadeid_loja
        const motivonaoentregue = array[x].motivonaoentregue
        const entregue = array[x].entregue
        //const data_update_local = array[x].data_update_local
        //const status_sincronizacao = array[x].status_sincronizacao
        //const alterado = array[x]. alterado
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

        const updatealterado =` 
        UPDATE TABLET_CARGAS_PEDIDOS2 SET alterado = '2'
        WHERE
        conta =  '${conta}'
        and cargaid = '${cargaid}'
        and romaneioid = '${romaneioid}'
        and entidadeid_loja = '${entidadeid_loja}'`;
        
        for (x=0; x<tamanhoarray; x++){
            //Execução
            sqlpool.request().query(update).then((result) => {
                console.log("Update no banco LOCAL feito com sucesso");
                return result
            }).catch((err) => {
                console.log("Falha no update ", err)
                throw err
            });
            client.query(updatealterado).then((result) => {
                console.log("Update no banco NUVEM feito com sucesso");
                return result
            }).catch((err) => {
                console.log("Falha no update ", err)
                throw err
            });
        };
    } catch {
        console.log("Erro na atualização de pedidos ", err);
    };
};
module.exports = {updateped};