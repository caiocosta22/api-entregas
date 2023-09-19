'use strict'

const http = require('http');
const debug = require('debug')('gpvendas:server');
const app = require('../index.js');
const port = normalizePort(process.env.PORT || 3082);

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
// Função que retorna uma Promise para a requisição POST usando http.request
function makePostRequest(options) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve(data);
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

// Requisições executadas de 5 em 5 minutos usando async/await
async function Timer() {
    const options = {
        hostname: 'localhost',
        port: 3082,
        method: 'POST',
    };
    
    try {
        options.path = '/insert/cargas';
        await makePostRequest(options);
        console.log(" *Sincronização de INSERT CARGA executada com sucesso*");
        console.log("-------------------------------------------------------");

        options.path = '/insert/cargaspedidos';
        await makePostRequest(options);
        console.log(" *Sincronização de INSERT PED executada com sucesso*");
        console.log("-------------------------------------------------------");

        options.path = '/update/pedidos';
        await makePostRequest(options);
        console.log(" *Sincronização de UPDATE executada com sucesso*");
        console.log("-------------------------------------------------------");
    } catch(error){
        console.log("Erro na sincronização", error.message);
    }
}

const intervalo = 5 * 60 * 1000; // 5 minutos em milissegundos
setInterval(Timer, intervalo);