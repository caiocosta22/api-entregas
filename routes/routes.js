'use strict'

const express = require('express');
const router = express.Router();
const controllers = require('../controllers/controllers.js')

router.get('/teste', controllers.sincronizar);
router.post('/teste2',controllers.sincronizar2);

module.exports = router