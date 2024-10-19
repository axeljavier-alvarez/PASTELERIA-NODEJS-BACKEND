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


module.exports= api;