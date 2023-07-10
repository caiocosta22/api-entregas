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
        coalesce(motivonaoentregue,'') as motivonaoentregue,
        entregue,
        to_char(current_date, 'YYYY-MM-DD HH:MI:SS') as data_update_local,
        coalesce(status_sincronizacao,1) as status_sincronizacao, 
        alterado,
        coalesce(latitude_checkin,'0') as latitude_checkin,
        coalesce(longitude_checkin,'0') as longitude_checkin,
        coalesce(cidade_checkin,'') as cidade_checkin,
        coalesce(estado_checkin,'') as estado_checkin,
        coalesce(cep_checkin,'') as cep_checkin,
        coalesce(rua_checkin,'') as rua_checkin,
		coalesce(to_char(data_checkin, 'YYYY-MM-DD HH:MI:SS'),'00000000') as data_checkin,
        coalesce(to_char(data_entrega, 'YYYY-MM-DD HH:MI:SS'),'00000000') as data_entrega,
		coalesce(to_char(data_naoentregue, 'YYYY-MM-DD HH:MI:SS'),'00000000') as data_naoentregue,
		coalesce(canhoto,'0') as canhoto,
        coalesce(justificativaatraso,'não informado') as justificativaatraso
            FROM TABLET_CARGAS_PEDIDOS
            WHERE ALTERADO = '1'
        AND IDG2 = 2274 
        AND DT_EMISSAO > (SELECT NOW() - INTERVAL '7 DAY')`;
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
        const data_update_local = array[x].data_update_local
        const status_sincronizacao = array[x].status_sincronizacao
        const alterado = array[x]. alterado
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
        motivonaoentregue = '${motivonaoentregue}',
        entregue = '${entregue}',
        status_sincronizacao = '${status_sincronizacao}', 
        alterado = ${alterado},
        latitude_checkin = '${latitude_checkin}',
        longitude_checkin = '${longitude_checkin}',
        cidade_checkin = '${cidade_checkin}',
        estado_checkin = '${estado_checkin}',
        cep_checkin = '${cep_checkin}',
        rua_checkin = '${rua_checkin}'
        data_checkin = '${data_checkin}',
        data_entrega = '${data_entrega}',
        data_naoentregue = '${data_naoentregue}',
        canhoto = ${canhoto},
        data_update_local = ${data_update_local},
        justificativaatraso = '${justificativaatraso}'
            WHERE
        conta =  '${conta}'
        and cargaid = '${cargaid}'
        and romaneioid = '${romaneioid}'
        and entidadeid_loja = '${entidadeid_loja}'`;

        /*console.log(conta, // ok
            cargaid, // ok
            romaneioid, // ok
            entidadeid_loja, // ok
            motivonaoentregue, // ok
            entregue, // ok
            data_update_local, // tratar
            status_sincronizacao, // ok
            latitude_checkin, //tratar
            longitude_checkin, //tratar
            cidade_checkin, //tratar
            estado_checkin, //tratar
            cep_checkin, //tratar
            rua_checkin, //tratar
            data_checkin, //tratar
            data_entrega, //tratar (formatar data)
            data_naoentregue, //tratar
            canhoto, // ok
            justificativaatraso)*/
        //console.log("Oi")
        //console.log(tamanhoarray)
        //console.log(x)
        for (x=0; x<tamanhoarray; x++){
            //Execução
            //const updatesql = request.query(update);
            sqlpool.request().query(update).then((result) => {
                console.log("Update feito com sucesso")
                return result
            }).catch((err) => {
                console.log("Update deu errado ", err)
                throw err
            })
            //const resultupdate = updatesql.recordset;
            //const linhasafetadas = resultupdate.rowsAffected;
            //const contasatualizadas = resultupdate.map(row => row.conta);
            //console.log("Conta atualizada: ",contasatualizadas);
        };
    } catch {
        console.log("Erro na atualização de pedidos ", err);
    };
};
module.exports = {updateped};