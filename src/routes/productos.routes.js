const express = require('express');
const cors = require('cors'); // Importa cors
const multer = require('multer');

// Configuración de multer para manejar archivos
const upload = multer({ dest: 'src/controllers/imagenes' }); // Asegúrate de que esto esté configurado

const ProductosController = require('../controllers/productos.controller');
const autenticacionToken = require('../middlewares/autenticacion');

const api = express.Router();

// Configura CORS
api.use(cors({
    origin: 'http://localhost:4200', // Cambia esto si tu aplicación Angular está en otro puerto
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'] // Cabeceras permitidas
}));

// Middleware para manejar datos de formularios
api.use(express.urlencoded({ extended: true })); // Para manejar datos de formularios

/* Rutas */
api.post('/agregarProductosRolGestor/:idSucursal/:idCategoria', 
    autenticacionToken.Auth, 
    upload.single('imagen'), // Usar multer para manejar la carga de archivos
    ProductosController.agregarProductoRolGestor
);

api.get('/verProductosRolGestor/:idSucursal/:idCategoria', autenticacionToken.Auth, ProductosController.verProductosRolGestor);
api.get('/verProductosPorCategorias/:ID', autenticacionToken.Auth, ProductosController.obtenerProductosPorIdCategoria);
api.get('/verTodosProductos', autenticacionToken.Auth, ProductosController.obtenerProductos);

/* FUNCIONES QUE FALTAN */
api.get('/verProductosRolAdmin', autenticacionToken.Auth, ProductosController.obtenerProductosRolAdmin);
api.put('/editarProductosRolGestor/:ID', autenticacionToken.Auth, ProductosController.editarProductosRolGestor);
api.delete('/eliminarProductosRolGestor/:ID', autenticacionToken.Auth, ProductosController.eliminarProductosRolGestor);
api.get('/verProductosPorId/:ID', autenticacionToken.Auth, ProductosController.verProductosPorId);

/* TAREAS DEL ROL_CLIENTE */
api.get('/verProductosPorSucursal/:ID', autenticacionToken.Auth, ProductosController.obtenerProductosPorIdSucursal);
api.get('/verProductoPorIdRolCliente/:ID', autenticacionToken.Auth, ProductosController.verProductosPorIdRolCliente);
api.get('/verProductosRolCliente/:idSucursal/:idCategoria', autenticacionToken.Auth, ProductosController.verProductosRolCliente);

module.exports = api;