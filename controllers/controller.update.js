'use strict';
const models = require('../models/models.update.js');
function sincUpd(request, response){
    models.updateped (request, response).then(result => {
        return response.status(200).json({message: "Requisição Concluída"});
    }).catch(error => {
        return response.status(404).json({error: "Erro com a requisição"});
    });
};
module.exports = {sincUpd};