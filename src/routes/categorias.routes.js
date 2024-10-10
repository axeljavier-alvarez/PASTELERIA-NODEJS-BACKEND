const express = require('express');

const CategoriasController = require('../controllers/categorias.controller');
const autenticacionToken = require ('../middlewares/autenticacion');
const MulterImagen = require('../middlewares/multer')
const api = express.Router();


api.post('/agregarCategoria', autenticacionToken.Auth, CategoriasController.AgregarCategoria);
api.put ('/editarCategoria/:ID', autenticacionToken.Auth, CategoriasController.editarCategoria);
api.delete ('/eliminarCategoria/:ID', autenticacionToken.Auth, CategoriasController.eliminarCategoriaRolGestor);
api.get('/getCategorias', autenticacionToken.Auth, CategoriasController.ObtenerCategorias);
api.get ('/getCategoriaRolGestorID/:ID' , autenticacionToken.Auth , CategoriasController.getCategoriaIdRolGestor)

/* funcion para agregar modificada */

api.post('/agregarCategoriaAdmin', 
    autenticacionToken.Auth, 
    MulterImagen.single('imagen'), 
    CategoriasController.AgregarCategoriaRolAdmin
);

api.put ('/editarCategoriaAdmin/:ID', autenticacionToken.Auth, CategoriasController.editarCategoriaRolAdmin);
api.delete ('/eliminarCategoriaAdmin/:idCategoria', autenticacionToken.Auth, CategoriasController.eliminarCategoriaRolAdmin);
api.get ('/getCategoriaAdmin', autenticacionToken.Auth , CategoriasController.getCategoriaRolAdmin);
api.get ('/getCategoriasIDRolAdmin/:ID', autenticacionToken.Auth, CategoriasController.getCategoriaIDRolAdmin);
api.get('/getCategoriasRolCliente', autenticacionToken.Auth, CategoriasController.ObtenerCategoriasRolCliente);


/* SIN TOKEN */
api.get ('/obtenerCategoriasCualquiera', CategoriasController.ObtenerCategoriasCualquiera);


/* al momento de subir esto a github, eliminar las librerias :) */
module.exports= api;