const express = require('express');

const FacturaController = require('../controllers/facturas.controller');
const autenticacionToken = require ('../middlewares/autenticacion');

const api = express.Router();

//api.post('/generarFacturas', autenticacionToken.Auth, FacturaController.GenerarFactura);
// CREAR FUNCION
api.post('/crearFacturaCliente', autenticacionToken.Auth, FacturaController.CrearFacturaCliente);

api.get('/verFacturaPorPedido/:idPedido', autenticacionToken.Auth, FacturaController.verFacturaPorPedido);

api.get('/ObtenerTodasCajas', autenticacionToken.Auth, FacturaController.ObtenerTodasCajas);



/* 1. VER HISTORIAL DE CREDITO POR ID SUCU */
api.get('/verFacturaCredito/:idSucursal', autenticacionToken.Auth, FacturaController.verFacturaCredito);

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

/* 8. ver factura por id sucursal para cajero y facturador solo de efectivo */

api.get('/obtenerFacturasPorIdSucursal/:idSucursal', autenticacionToken.Auth, FacturaController.obtenerFacturasPorIdSucursal);

/* 9. ver caja por usuario */

api.get('/verCajaPorUsuario', autenticacionToken.Auth, FacturaController.verCajaPorUsuario);

/* 10 confirmar pedidos credito */


module.exports= api;