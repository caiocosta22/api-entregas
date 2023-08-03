/*
CREATE TABLE [dbo].[INTEGRACAO_API_ENTREGAS](
	[LOGID] [int] IDENTITY(1,1) NOT NULL,
	[DATASINCRONIZACAO_INICIO] [datetime] NULL,
	[DATASINCRONIZACAO_FIM] [datetime] NULL,
	[TIPO] [int] NULL,
	[DESCRICAO] [varchar](300) NULL,
	[STATUS] [varchar](1) NULL,
PRIMARY KEY CLUSTERED 
(
	[LOGID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
-----------------------------------------------------------------------------------------------------------------------------------------
ALTER VIEW [dbo].[V_SITE_ULTIMAINTEGRACAO] AS
SELECT MAX(DATASINCRONIZACAO_INICIO) AS DATASINC FROM INTEGRACAO_API_ENTREGAS
-----------------------------------------------------------------------------------------------------------------------------------------
ALTER   VIEW [dbo].[V_SITE_CARGAS2] AS
 SELECT DISTINCT (SELECT VALOR FROM CONFIGURACAO WHERE PARAMETRO = 31601) AS idg2
	  , A.CARGAID AS cargaid
	  , CONVERT(VARCHAR,A.DATA,120) AS data
	  , A.STATUS AS status
	  , ISNULL(C.PLACA,0) AS placa
	  , ISNULL(A.KM_INICIAL,0) AS km_inicial
	  , ISNULL(A.KM_FINAL,0) AS km_final
	  , isnull(A.VEICULOID,0) AS veiculoid
	  , A.ENTIDADEID_LOJA AS entidadeid_loja
	  , CAST(ISNULL(A.OBS, 'não informado') AS VARCHAR(500)) AS obs
	  , A.DATA_SAIDA AS DATA_SAIDA
	  , A.DATA_RETORNO AS DATA__RETORNO
	  , ISNULL(B.DESCRICAO,'não informado') AS nome_motorista
	  , ISNULL(C.DESCRICAO,'não informado') AS descricao
	  , ISNULL(A.ENTIDADEID_MOTORISTA,0) AS entidadeid_motorista
      , D.CONTA
	  , D.ORDEM
	  , D.MOTIVONAOENTREGUE
	  , D.ENTREGUE
	  , D.LATITUDE
	  , D.LONGITUDE
	  , D.CEP
	  , D.RUA
	  , D.DATA_CHECKIN
	  , D.DATA_ENTREGA
	  , D.DATA_NAO_ENTREGUE_UPD
	  , D.OCORRENCIAID
	  , D.ROMANEIOID
	  , D.JUSTIFICATIVAATRASO
	FROM CARGA A 
	JOIN CARGA_ROMANEIO_PED D ON (A.CARGAID = D.CARGAID AND A.ENTIDADEID_LOJA = D.ENTIDADEID_LOJA)
	JOIN ENTIDADES B ON (A.ENTIDADEID_MOTORISTA = B.ENTIDADEID)
	LEFT JOIN VEICULOS C  ON  (A.VEICULOID = C.VEICULOID)
   --JOIN V_SITE_ULTIMAINTEGRACAO Y
  WHERE 
		A.STATUS = 4 --> STATUS: EM ROTA
	--AND D.DATASINCRONIZACAO IS NULL
	--AND DATAFINALIZACAO >= Y.DATASINC => APOS O PRIMEIRO SINC
	AND A.DATA >= DATEADD(DAY, -30, GETDATE())-- => NA PRIMEIRA SINCRONIZACAO
UNION
SELECT DISTINCT (SELECT VALOR FROM CONFIGURACAO WHERE PARAMETRO = 31601) AS idg2
	  , A.CARGAID AS cargaid
	  , CONVERT(VARCHAR,A.DATA,120) AS data
	  , A.STATUS AS status
	  , ISNULL(C.PLACA,0) AS placa
	  , ISNULL(A.KM_INICIAL,0) AS km_inicial
	  , ISNULL(A.KM_FINAL,0) AS km_final
	  , isnull(A.VEICULOID,0) AS veiculoid
	  , A.ENTIDADEID_LOJA AS entidadeid_loja
	  , CAST(ISNULL(A.OBS, 'não informado') AS VARCHAR(500)) AS obs
	  , A.DATA_SAIDA AS DATA_SAIDA
	  , A.DATA_RETORNO AS DATA__RETORNO
	  , ISNULL(B.DESCRICAO,'não informado') AS nome_motorista
	  , ISNULL(C.DESCRICAO,'não informado') AS descricao
	  , ISNULL(A.ENTIDADEID_MOTORISTA,0) AS entidadeid_motorista
      , D.CONTA
	  , D.ORDEM
	  , D.MOTIVONAOENTREGUE
	  , D.ENTREGUE
	  , D.LATITUDE
	  , D.LONGITUDE
	  , D.CEP
	  , D.RUA
	  , D.DATA_CHECKIN
	  , D.DATA_ENTREGA
	  , D.DATA_NAO_ENTREGUE_UPD
	  , D.OCORRENCIAID
	  , D.ROMANEIOID
	  , D.JUSTIFICATIVAATRASO
	  FROM CARGA A 
   JOIN CARGA_ROMANEIO_PED D ON (A.CARGAID = D.CARGAID AND A.ENTIDADEID_LOJA = D.ENTIDADEID_LOJA)
   JOIN ENTIDADES B ON (A.ENTIDADEID_MOTORISTA = B.ENTIDADEID)
   LEFT JOIN VEICULOS C  ON  (A.VEICULOID = C.VEICULOID)
   --JOIN V_SITE_ULTIMAINTEGRACAO Y
	WHERE
		A.STATUS = 2 --> STATUS: FINALIZADOS
	--AND DATAFINALIZACAO >= Y.DATASINC => APOS O PRIMEIRO SINC
		AND A.DATA >= DATEADD(DAY, -30, GETDATE())
-----------------------------------------------------------------------------------------------------------------------------------------
ALTER                                                                                       view [dbo].[V_SITE_CARGASPEDIDOS2] AS
  SELECT DISTINCT (SELECT VALOR FROM CONFIGURACAO WHERE PARAMETRO = 31601) AS IDG2
		, X.CARGAID AS cargaid
		, X.ENTIDADEID_LOJA AS entidadeid_loja
		, X.CONTA AS conta
		, ISNULL(X.ORDEM,0) AS ordem
		, B.NUMDOCUMENTO AS numdocumento
		, X.MOTIVONAOENTREGUE  	 
		, ISNULL(CLI.DESCRICAO,'') as cli_razaosocial
		, ISNULL(CLI.ENDERECO,'') AS endereco
		, ISNULL(CLI.COMPLEMENTO,'') AS complemento
		, ISNULL(CLI.BAIRRO,'') AS bairro
		, ISNULL(CLI.CIDADE,'') AS cidade
		, ISNULL(CLI.UF,'') AS uf
		, ISNULL(CLI.CEP,'') AS cep
		, ISNULL(CLI.NUMERO,'') AS numero
		, ISNULL(CONVERT(VARCHAR, B.DATAEMISSAO, 120),'')AS dt_emissao
		, ISNULL(B.QUANTIDADE, 0) AS volumes
		, CASE WHEN((X.ENTREGUE IS NULL) OR (X.ENTREGUE = 'N') OR (X.ENTREGUE = 'N')) THEN 'N'
		 ELSE 'S'
		 END AS ENTREGUE
		, B.ENTIDADEID_CLIENTE AS entidadeid_cliente
		, NULL AS DATA_INSERCAO_NUVEM
		, NULL AS DATA_UPDATE_LOCAL 
		, 0 AS ALTERADO 
		, ISNULL(X.LATITUDE,0) AS latitude_checkin  
		, ISNULL(X.LONGITUDE,0) AS longitude_checkin 
		, X.CEP AS cep_checkin
		, X.RUA AS rua_checkin 
		, X.DATA_CHECKIN AS data_checkin
		, X.DATA_ENTREGA AS data_entrega 
		, X.DATA_NAO_ENTREGUE_UPD AS data_naoentregue
		, ISNULL(X.OCORRENCIAID,0) AS ocorrenciaid
		, X.ROMANEIOID AS romaneioid
		, ISNULL(X.JUSTIFICATIVAATRASO,'0') AS JUSTIFICATIVAATRASO
	FROM V_SITE_CARGAS2 X
	JOIN MOVIMENTO_DIA B ON (X.ENTIDADEID_LOJA = B.ENTIDADEID_LOJA AND X.CONTA = B.CONTA)
	JOIN V_CLIENTES CLI ON (B.ENTIDADEID_CLIENTE = CLI.ENTIDADEID)
	WHERE
		 X.DATA >= DATEADD(DAY, -30, GETDATE()) -- NA PRIMEIRA SINCRONIZACAO
-----------------------------------------------------------------------------------------------------------------------------------------
// ...
// Fora do loop, defina o parâmetro 'canhoto' apenas uma vez
const canhoto = array[x].canhoto;
request.input('canhoto', sql.VarBinary, canhoto);

// Loop para aplicar os Updates
for (x = 0; x < tamanhoarray; x++) {
  // Execução no banco local
  await request.query(update).then((result) => {
    // Faça o que precisa ser feito com o resultado, se necessário
  }).catch((err) => {
    console.log("Falha no update ", err);
    throw err;
  });

  // Execução no banco nuvem
  await client.query(updatealterado).then((result) => {
    // Faça o que precisa ser feito com o resultado, se necessário
  }).catch((err) => {
    console.log("Falha no update ", err);
    throw err;
  });
}
// ...




















*/