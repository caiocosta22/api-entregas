'use strict'

const http = require('http');
const debug = require('debug')('gpvendas:server');
const app = require('../index.js');
const axios = require('axios');
const port = normalizePort(process.env.PORT || '3000');
/*
MAIN_URL = "http://cloud47.p80.com.br:8080/WSEntregas/webresources/";
GET_CARGAS_URL = "carga/consultaCargas/";
POST_INSERT_CARGAS_URL = "carga/insereCargasBatch/";
POST_INSERT_PEDIDOS_URL = "pedido/inserePedidosBatch/";
GET_PEDIDOS_ALTERADOS_URL = "pedido/consultaPedidosAlterados/"; //A CONSULTA DE PEDIDOS É FEITA POR UM POST
POST_UPDATE_PEDIDOS_URL = "pedido/updatePedidoStatusSinc/";
GET_CARGAS_EM_ABERTO_URL = "carga/consultaCargasPorIdg2/";
POST_CARGAS_UPDATE_URL = "carga/updateStatusSincronizacaoCarga/";
POST_PEDIDO_OCORRENCIA_URL = "pedidoOcorrencia/inserePedidoOcorrenciaBatch/";
GET_PEDIDO_OCORRENCIA_URL = "pedidoOcorrencia/consultaPedidosOcorrencias/";
*/ // ROTAS DO PROJETO

app.set('port, port');

const server = http.createServer(app);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
console.log("Api rodando na porta " + port);

//Funcao para normalizar a porta
function normalizePort(val) {
    const port = parseInt(val, 10);
        if (isNaN(port)){
            return val
            //O valor fornecido não for numero
        }
        if (port>=0){
            return port;
            //O valor fornecido for válido
        }
    return false
    //O valor fornecido for inválido
};

//Funcao para exibir erros do servidor
function onError(error){
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string' ?
        'Pipe ' + port :
        'Port ' + port;

    switch(error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADORINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }

};

function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string'
        ? 'pipe' + addr
        : 'port' + addr.port;
        debug('Listening on' + bind);
};

/*
//Funcao timer
function Timer() {
    (async () => {
        try {
            await axios.post('http://localhost:3000/pedfaturado/sincronizar')
        } catch (error) {
            console.log("Erro no timer ");
        }
      })();
  };
const intervalo = 20 * 1000; // Tempo setado para 5 em 5 MINUTOS
setInterval(Timer, intervalo);
*/ 