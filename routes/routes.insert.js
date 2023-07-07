'use strict'
const express = require('express');
const router = express.Router();
const controllers = require('../controllers/controllers.insert.js')

router.post('/cargas', controllers.sincCarga);
router.post('/cargaspedidos',controllers.sincPed);

module.exports = router