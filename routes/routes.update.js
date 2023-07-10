'use strict'
const express = require('express');
const router = express.Router();
const controllers = require('../controllers/controller.update.js')

router.post('/pedidos', controllers.sincUpd);

module.exports = router