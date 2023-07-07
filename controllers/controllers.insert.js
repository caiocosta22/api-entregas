'use strict'
const models = require('../models/models.insert.js');

function sincCarga(request, response){
    models.inserecargas(request, response).then(result => {
        return response.status(201).json({message: "Requisição Concluída"});
    }).catch(error => {
        return response.status(404).json({error: "Erro com a requisição"});
    });
};

function sincPed(request, response){
    models.insereped(request, response).then(result => {
        return response.status(201).json({message: "Requisição Concluída"});
    }).catch(error => {
        return response.status(404).json({error: "Erro com a requisição"});
    });
};

module.exports = {sincCarga,sincPed};