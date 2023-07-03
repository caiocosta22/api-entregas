'use strict'

const models = require('../models/models.js');

function sincronizar(request, response){
    models.teste1(request, response).then(result => {
        return response.status(200).json({message: "Requisição Concluída"});
    }).catch(error => {
        return response.status(404).json({error});
    })
};

function sincronizar2(request, response){
    models.teste2(request, response).then(result => {
        return response.status(200).json({message: "Requisição Concluída"});
    }).catch(error => {
        return response.status(404).json({error});
    })
};

module.exports = {sincronizar,sincronizar2}