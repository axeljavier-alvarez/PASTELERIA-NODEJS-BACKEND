const express = require('express');
const tarjetasController = require('../controllers/tarjetas.controller');

const api = express.Router();

api.post('/agregarTarjetaCredito', tarjetasController.agregarTarjeta);

module.exports= api;
