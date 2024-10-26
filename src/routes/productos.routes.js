const express = require('express');

const ProductosController = require('../controllers/productos.controller');
const autenticacionToken = require ('../middlewares/autenticacion');
const MulterImagen = require('../middlewares/multer')
const api = express.Router();


/* NUEVA IMPLEMENTACIÓN DE IMAGEN */
// const multer = require('multer');
// const path = require('path');
// Configuración de multer
/* const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/controllers/imagenes'); // Carpeta donde se guardarán las imágenes
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Nombre del archivo
    }
});

const upload = multer({ storage: storage }); */

/*ROL_GESTOR IMPLEMENTANDO PARA AGREGAR IMAGEN*/
api.post('/agregarProductosRolGestor/:idSucursal/:idCategoria', 
    autenticacionToken.Auth, 
    MulterImagen.single('imagen'), // Usa el middleware importado
    ProductosController.agregarProductoRolGestor
);

api.get('/verProductosRolGestor/:idSucursal/:idCategoria', autenticacionToken.Auth, ProductosController.verProductosRolGestor);

api.get('/verProductosPorCategorias/:ID', autenticacionToken.Auth, ProductosController.obtenerProductosPorIdCategoria);

api.get('/verTodosProductos', autenticacionToken.Auth, ProductosController.obtenerProductos);

/* FUNCIONES QUE FALTAN */
/* VER PRODUCTOS ROL ADMIN */
api.get('/verProductosRolAdmin', autenticacionToken.Auth, ProductosController.obtenerProductosRolAdmin);

/* EDITAR PRODUCTOS ROL GESTOR */
api.put('/editarProductosRolGestor/:ID', autenticacionToken.Auth , ProductosController.editarProductosRolGestor);
/* ELIMINAR PRODUCTOS ROL GESTOR  */
api.delete('/eliminarProductosRolGestor/:ID', autenticacionToken.Auth , ProductosController.eliminarProductosRolGestor);
/* VER PRODUCTOS POR ID ROL GESTOR */
api.get('/verProductosPorId/:ID', autenticacionToken.Auth, ProductosController.verProductosPorId);

/* TAREAS DEL ROL_CLIENTE */
api.get('/verProductosPorSucursal/:ID', autenticacionToken.Auth, ProductosController.obtenerProductosPorIdSucursal);

api.get('/verProductoPorIdRolCliente/:ID', autenticacionToken.Auth, ProductosController.verProductosPorIdRolCliente);
api.get('/verProductosRolCliente/:idSucursal/:idCategoria', autenticacionToken.Auth, ProductosController.verProductosRolCliente);

/* SIN TOKEN */

api.get ('/obtenerProductosCualquiera', ProductosController.ObtenerProductosCualquiera);


api.get('/productosInventario/:ID', autenticacionToken.Auth, ProductosController.productosInventario);


api.get('/obtenerProductosPorIdSucursalSinToken/:ID',  ProductosController.obtenerProductosPorIdSucursalSinToken);

api.get('/obtenerProductosDeMiSucu', autenticacionToken.Auth, ProductosController.obtenerProductosDeMiSucu);

api.get('/obtenerUsuariosSucursal/:idSucursal', autenticacionToken.Auth, ProductosController.obtenerUsuariosSucursal);


module.exports= api;