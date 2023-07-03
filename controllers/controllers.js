'use strict'

const models = require('../models/models.js');

function sincronizar(req, res){
    (req, function(err,result){
        if (err){
            res.status(500).send(err);
        } else {
            res.status(201).send("Tudo ok");
        }
    });
};

module.exports = {sincronizar}