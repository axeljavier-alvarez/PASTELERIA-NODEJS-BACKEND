const express = require('express');

const PedidosController = require('../controllers/pedidos.controller');
const autenticacionToken = require ('../middlewares/autenticacion');
const api = express.Router();

// GENERAR PEDIDO EN DESARROLLO TODAVIA
api.post('/generarPedido/:idCarrito', autenticacionToken.Auth, PedidosController.generarPedido);
// VER LOS PEDIDOS DEL CLIENTE QUE LOS GENERO
api.get('/verPedidosCliente', autenticacionToken.Auth, PedidosController.verPedidosCliente);
 
// ELIMINAR PEDIDO Y EL STOCK REGRESA A DONDE ESTABA EN LA COLECCIÓN PRODUCTOS
api.delete("/eliminarPedidoCliente/:idPedido", autenticacionToken.Auth, PedidosController.eliminarPedido);

// ver todos los pedidos
api.get('/verPedidosRolCajero', autenticacionToken.Auth, PedidosController.ObtenerTodosLosPedidos);

// ver pedidos del cliente en especifico
api.get('/verPedidosClienteRegistrado', autenticacionToken.Auth, PedidosController.verPedidosClienteRegistrado);


api.post('/asignarPedidoRepartidor', autenticacionToken.Auth, PedidosController.asignarPedidoRepartidor);

/* ver pedidos por sucursal */
api.get('/verPedidosPorSucursal/:ID', autenticacionToken.Auth, PedidosController.obtenerPedidosPorIdSucursal);

api.get('/pedidoClienteSinConfirmar', autenticacionToken.Auth, PedidosController.pedidoClienteSinConfirmar);


api.get('/pedidoEnEsperaCredito/:idSucursal', autenticacionToken.Auth, PedidosController.pedidoEnEsperaCredito);


api.get('/verPedidosSinConfirmarCliente', autenticacionToken.Auth, PedidosController.verPedidosSinConfirmarCliente);

api.get('/pedidoConfirmadoCredito/:idSucursal', autenticacionToken.Auth, PedidosController.pedidoConfirmadoCredito);

/* que el cajero edite el pedido */
api.get('/getPedidoPorId/:ID', autenticacionToken.Auth, PedidosController.getPedidoPorId);

/* editar pedido */
api.put('/editarPedidosRolCajero/:ID', autenticacionToken.Auth, PedidosController.editarPedidosRolCajero);

/* nuevas funciones para efectivo*/
api.post('/confirmarPedidoEfectivo', autenticacionToken.Auth, PedidosController.confirmarPedidoEfectivo);

api.get('/pedidoClienteEfectivoSinConfirmar', autenticacionToken.Auth, PedidosController.pedidoClienteEfectivoSinConfirmar);

api.get('/verPedidosConfirmadosEfectivo', autenticacionToken.Auth, PedidosController.verPedidosConfirmadosEfectivo);


/* NUEVAS FUNCIONES */
api.get('/verPedidosSinConfirmarEfectivo/:idSucursal', autenticacionToken.Auth, PedidosController.verPedidosSinConfirmarEfectivo);

api.get('/verPedidosSinConfirmarCredito/:idSucursal', autenticacionToken.Auth, PedidosController.verPedidosSinConfirmarCredito);

api.get('/pedidoConfirmadoEfectivo/:idSucursal', autenticacionToken.Auth, PedidosController.pedidoConfirmadoEfectivo);

/* post */
api.post('/confirmarPedidoCredito', autenticacionToken.Auth, PedidosController.confirmarPedidoCredito);

/* get ver pedidos */

api.get('/verPedidoUsuario/:idUsuario', autenticacionToken.Auth, PedidosController.verPedidoAsignado);

/* post */

api.post('/confirmarPedidoGeneradoEfectivo', autenticacionToken.Auth, PedidosController.confirmarPedidoGeneradoEfectivo);

api.get('/pedidosEntregadosCredito/:idSucursal', autenticacionToken.Auth, PedidosController.pedidosEntregadosCredito);

api.get('/pedidosEntregadosEfectivoGenerados/:idSucursal', autenticacionToken.Auth, PedidosController.pedidosEntregadosEfectivoGenerados);

/* eliminar pedido */
api.delete('/eliminarPedidosSinConfirmar/:idPedido', autenticacionToken.Auth, PedidosController.eliminarPedidosSinConfirmar);
/* ver pedido por id */
api.get('/verPedidosPorId/:idPedido', autenticacionToken.Auth, PedidosController.verPedidosPorId);

api.get('/verPedidosUsuario', autenticacionToken.Auth, PedidosController.verPedidosUsuario);





module.exports= api;