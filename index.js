'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const routeinsert = require('../src/routes/routes.insert.js');
const routeupdate = require('../src/routes/routes.update.js')

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/insert', routeinsert);
app.use('/update', routeupdate)

module.exports = app;