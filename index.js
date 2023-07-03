'use strict'

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

const router = require('../src/routes/routes.js');
app.use('/', router);

module.exports = app;