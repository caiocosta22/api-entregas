"use strict";
const pgpool = require("../config/pgconfig.js");
const sqlpool = require("../config/sqlconfig.js");
const sql = require("mssql");

async function updateped() {
  // Pools de conexões
  const client = await pgpool.connect();
  const request = sqlpool.request();

  //Inicio da sincronização
  try {
    // Conexão com SQL SERVER
    await sqlpool.connect();

    // Consulta de pedidos alterados
    const query = `SELECT conta,
        cargaid,
        romaneioid,
        entidadeid_loja,
        coalesce(motivonaoentregue,'não informado') as motivonaoentregue,
        coalesce(entregue,'N')as entregue,
        coalesce(status_sincronizacao,1) as status_sincronizacao, 
        alterado,
        coalesce(latitude_checkin,'0') as latitude_checkin,
        coalesce(longitude_checkin,'0') as longitude_checkin,
        coalesce(cidade_checkin,'não informado') as cidade_checkin,
        coalesce(estado_checkin,'não informado') as estado_checkin,
        coalesce(cep_checkin,'não informado') as cep_checkin,
        coalesce(rua_checkin,'não informado') as rua_checkin,
        coalesce(justificativaatraso,'não informado') as justificativaatraso,
        TO_CHAR(data_checkin, 'YYYY/MM/DD') as data_checkin,
        TO_CHAR(data_entrega, 'YYYY/MM/DD') as data_entrega,
		TO_CHAR(data_naoentregue, 'YYYY/MM/DD') as data_naoentregue,
		canhoto
            FROM TABLET_CARGAS_PEDIDOS
            WHERE ALTERADO = '1'
        AND IDG2 = 2274
        AND DT_EMISSAO > (SELECT NOW() - INTERVAL '14 DAY')`;
    const resultquery = await client.query(query);
    const array = resultquery.rows;
    const tamanhoarray = resultquery.rowCount;

    //Inserção na tabela de Log
    const logsql = `INSERT INTO INTEGRACAO_API_ENTREGAS(DATASINCRONIZACAO_INICIO, tipo, descricao, status) values(getdate(), 1, 'UPDATE PEDIDOS', '1')`;
    await request.query(logsql);

    //Tratativa para se não obter resultados no SELECT acima
    if (tamanhoarray == 0) {
      const ultimologsql = `update INTEGRACAO_API_ENTREGAS set DATASINCRONIZACAO_FIM = getdate(), status = '2' where status = '1' and DATASINCRONIZACAO_FIM is null`;
      await request.query(ultimologsql);
      return console.log("Nenhum pedido para ser atualizado");
    }
    let x = 0;
    async function executaupdate() {
      try {
        //variáveis
        const conta = array[x].conta;
        const cargaid = array[x].cargaid;
        const romaneioid = array[x].romaneioid;
        const motivonaoentregue = array[x].motivonaoentregue;
        const entregue = array[x].entregue;
        const latitude_checkin = array[x].latitude_checkin;
        const longitude_checkin = array[x].longitude_checkin;
        const cidade_checkin = array[x].cidade_checkin;
        const estado_checkin = array[x].estado_checkin;
        const cep_checkin = array[x].cep_checkin;
        const rua_checkin = array[x].rua_checkin;
        const data_checkin = array[x].data_checkin;
        const data_entrega = array[x].data_entrega;
        const data_naoentregue = array[x].data_naoentregue;
        const canhotobuffer = Buffer.from(array[x].canhoto, 'hex')
        const justificativaatraso = array[x].justificativaatraso;
        const parametros = { canhoto: canhotobuffer };
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
        imagem_recibo = @canhoto
        WHERE
        conta = '${conta}'
        and cargaid = '${cargaid}'
        and romaneioid = '${romaneioid}'`;
        //preparando o update
        const ps = new sql.PreparedStatement(sqlpool);
        await ps.input('canhoto', sql.VarBinary);
        await ps.prepare(update);
        await ps.execute(parametros);
        await ps.unprepare();
        console.log(parametros);
        console.log("Update Finalizado");
      } catch (error) {
        console.log("Erro no update: ", error);
      }
    }

    //Laço para aplicar os Updates
    for (x = 0; x < tamanhoarray; x++) {
      try {
        await executaupdate();
      } catch (error) {
        console.log("Erro no update: ", error);
      }
    }

    //Update na Base da Nuvem
    const registroscontas = array.map((row) => row.conta).join(",");
    const registroscargas = array.map((row) => row.cargaid).join(",");
    const updatealterado = `update tablet_cargas_pedidos set alterado = 2
            where conta in (${registroscontas})
            and cargaid in (${registroscargas})
            and idg2 = 2274
            and alterado = 1`;
    await client.query(updatealterado);

    //Finalizando o registro no log
    console.log(x + " Updates foram executados");
    const ultimologsql = `update INTEGRACAO_API_ENTREGAS set DATASINCRONIZACAO_FIM = getdate(), status = '2' where status = '1' and DATASINCRONIZACAO_FIM is null`;
    await request.query(ultimologsql);
  } catch (err) {
    console.log("Erro na atualização de pedidos ", err);
    //Finalizando o registro no log
    const logsql = `INSERT INTO INTEGRACAO_API_ENTREGAS(DATASINCRONIZACAO_INICIO, tipo, descricao, status) values(getdate(), 1, 'UPDATE PEDIDOS FALHOU', '3')`;
    await request.query(logsql);
  } finally {
    await client.end();
    console.log("Conexão com o POSTGRES finalizada");
    await sqlpool.close();
    console.log("Conexão com o SQL SERVER finalizada");
  }
}
module.exports = { updateped };
