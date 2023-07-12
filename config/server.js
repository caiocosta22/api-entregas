'use strict'

const http = require('http');
const debug = require('debug')('gpvendas:server');
const app = require('../index.js');
const axios = require('axios');
const port = normalizePort(process.env.PORT || '3000');

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
//Registrando as horas, para o LOG da aplicação
const dataAtual = new Date();
const ano = dataAtual.getFullYear();
const dia = dataAtual.getDate();
const mes = (dataAtual.getMonth() + 1);
const horas = dataAtual.getHours();
const minutos = dataAtual.getMinutes();
//Funcao timer
async function Timer() {
        try {
            await axios.post('http://localhost:3000/insert/cargas');
            console.log("Sincronização de INSERT CARGA executada: " + dia + "/" + mes + "/" + ano + " As " + horas + ":" + minutos);
            await axios.post('http://localhost:3000/insert/cargaspedidos');
            console.log("Sincronização de INSERT PED executada: " + dia + "/" + mes + "/" + ano + " As " + horas + ":" + minutos);
            await axios.post('http://localhost:3000/update/pedidos');
            console.log("Sincronização de UPDATE executada: " + dia + "/" + mes + "/" + ano + " As " + horas + ":" + minutos);
        } catch {
            console.log("Erro na sincronização: " + dia + "/" + mes + "/" + ano + " As " + horas + ":" + minutos);
        };
    };   
const intervalo = 15 * 1000
setInterval(Timer, intervalo); 
