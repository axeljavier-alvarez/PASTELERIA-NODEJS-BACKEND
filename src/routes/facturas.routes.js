const express = require('express');

const FacturaController = require('../controllers/facturas.controller');
const autenticacionToken = require ('../middlewares/autenticacion');

const api = express.Router();

//api.post('/generarFacturas', autenticacionToken.Auth, FacturaController.GenerarFactura);
// CREAR FUNCION
api.post('/crearFacturaCliente', autenticacionToken.Auth, FacturaController.CrearFacturaCliente);

api.get('/verFacturaPorPedido/:idPedido', autenticacionToken.Auth, FacturaController.verFacturaPorPedido);

/* 1. VER HISTORIAL DE CREDITO POR ID SUCU */
api.post('/verFacturaCredito/:idSucursal', autenticacionToken.Auth, FacturaController.verFacturaCredito);

/* 2. AGREGAR CAJA */
api.post('/agregarCaja', autenticacionToken.Auth, FacturaController.agregarCaja);

/* 3. ver caja por id sucu */
api.get('/verCajaPorSucursal/:idSucursal', autenticacionToken.Auth, FacturaController.verCajaPorSucursal);

/* 4. editar caja facturador y admin */
api.put('/editarCaja/:idCaja',autenticacionToken.Auth, FacturaController.editarCaja);

/* 5. eliminar caja */
api.delete('/eliminarCaja/:idCaja',autenticacionToken.Auth, FacturaController.eliminarCaja);

/* 6. ver caja por id */
api.get('/getCajaPorId/:idCaja', autenticacionToken.Auth, FacturaController.getCajaPorId);

/* 7. crear factura para pago con efectivo cuando ya este confirmado, lo hace el cajero,
cumplir con ciertos requisitos */
api.post('/generarFacturaPagoEfectivo/:idPedido', autenticacionToken.Auth, FacturaController.generarFacturaPagoEfectivo);

module.exports= api;