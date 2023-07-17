'use strict'

const http = require('http');
const debug = require('debug')('gpvendas:server');
const app = require('../index.js');
const axios = require('axios');
const port = normalizePort(process.env.PORT || '8082');

app.set('port', port);

const server = http.createServer(app);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
console.log("Api rodando na porta " + port);

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

//Funcao timer
async function Timer() {
        try {
            await axios.post('http://localhost:8082/insert/cargas');
            console.log(" *Sincronização de INSERT CARGA executada com sucesso*");
            console.log("-------------------------------------------------------")
            await axios.post('http://localhost:8082/insert/cargaspedidos');
            console.log(" *Sincronização de INSERT PED executada com sucesso*");
            console.log("-------------------------------------------------------")
            await axios.post('http://localhost:8082/update/pedidos');
            console.log(" *Sincronização de UPDATE executada com sucesso*");
            console.log("-------------------------------------------------------")
        } catch {
            console.log("Erro na sincronização");
        };
    };   
const intervalo =   30 * 1000
setInterval(Timer, intervalo); 


