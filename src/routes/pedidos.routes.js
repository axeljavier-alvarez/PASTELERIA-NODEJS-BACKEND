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


module.exports= api;