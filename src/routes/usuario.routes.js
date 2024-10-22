const express = require('express');

const usuarioController = require('../controllers/usuarios.controller');
const autenticacionToken = require ('../middlewares/autenticacion');
const MulterImagen = require('../middlewares/multer')
const api = express.Router();

api.post('/login', usuarioController.Login);
api.post('/agregarUsuario',usuarioController.agregarUsuario);

/* ---------- ADMINISTRACIÓN DEL ROL ADMIN --------- */
api.post ('/agregarRolCliente', autenticacionToken.Auth,  usuarioController.agregarClienteRolAdmin);
/* Editar usuario, el ID es el que se puso en el codigo */
api.put ('/editarRolCliente/:ID', autenticacionToken.Auth, usuarioController.editarUsuarioRolCliente);
/* Eliminar usuario por medio del id*/
api.delete("/eliminarRolCliente/:ID", autenticacionToken.Auth, usuarioController.eliminarUsuarioRolCliente);
/* Ver usuarios que tengan ROL_CLIENTE*/
api.get('/getUsuariosRolCliente', autenticacionToken.Auth, usuarioController.getUsuariosRolCliente);
/* Ver propio usuario por ID ROL_CLIENTE, ver perfil en conclusión */
api.get('/getUsuarioRolCliente/:ID', autenticacionToken.Auth, usuarioController.getUsuarioIdRolCliente);

/* ---------------- TAREAS DEL ROL_ADMIN  ---------*/
/* editar perfil put ID*/
api.put ('/editarRolAdmin/:ID' , autenticacionToken.Auth, usuarioController.editarUsuarioRolAdmin);

/* agregar, ROL_FACTURADOR por defecto post*/
//api.post ('/agregarRolFacturador', autenticacionToken.Auth,  usuarioController.agregarFacturador);
api.post('/agregarRolFacturador', autenticacionToken.Auth, MulterImagen.single('imagen'), usuarioController.agregarFacturador);
/* agregar, ROL_EMPLEADO por defecto post*/
//api.post ('/agregarRolEmpleado',  autenticacionToken.Auth, usuarioController.agregarEmpleado);
api.post('/agregarRolEmpleado', autenticacionToken.Auth, MulterImagen.single('imagen'), usuarioController.agregarEmpleado);
/* cambiar ruta*/
//api.post ('/agregarRolGestor',  autenticacionToken.Auth, usuarioController.agregarGestor);
api.post('/agregarGestor', autenticacionToken.Auth,  MulterImagen.single('imagen'), usuarioController.agregarGestor);

/* ver usuarios con ROL_FACTURADOR get */
api.get ('/getUsuariosRolFacturador', autenticacionToken.Auth, usuarioController.getUsuariosRolFacturador);
/* ver usuarios con ROL_EMPLEADO  get*/
api.get ('/getUsuarioRolEmpleado', autenticacionToken.Auth, usuarioController.getUsuariosRolEmpleado);
/* ver usuarios con ROL_GESTOR get*/
api.get ('/getUsuarioRolGestor', autenticacionToken.Auth, usuarioController.getUsuariosRolGestor);
/* ver propio usuario por ID get ID*/
api.get ('/getUsuarioAdministrador/:ID', autenticacionToken.Auth, usuarioController.getUsuarioIdRolAdministrador);


/* ---------- TAREAS DEL ROL_FACTURADOR ------------- */
/* Editar usuario, el ID es el que se puso en el codigo */
api.put ('/editarRolFacturador/:ID', autenticacionToken.Auth, usuarioController.editarUsuarioRolFacturador);
/* Eliminar usuario por medio del id*/
api.delete("/eliminarRolFacturador/:ID", autenticacionToken.Auth, usuarioController.eliminarUsuarioRolFacturador);
/* Ver usuarios que tengan ROL_CLIENTE*/
api.get('/getUsuariosRolFacturador', autenticacionToken.Auth, usuarioController.getUsuariosRolFacturador);
/* Ver propio usuario por ID ROL_CLIENTE, ver perfil en conclusión */
api.get('/getUsuarioRolFacturador/:ID', autenticacionToken.Auth, usuarioController.getUsuarioIdRolFacturador);

/* ---------------TAREAS DEL ROL_GESTOR ---------- */
/* editar perfil */
api.put ('/editarRolGestor/:ID', autenticacionToken.Auth,  usuarioController.editarUsuarioRolGestor);
/* eliminar perfil */
api.delete ('/eliminarRolGestor/:ID', autenticacionToken.Auth, usuarioController.eliminarUsuarioRolGestor);
/* ver a los usuarios que tengan ROL_GESTOR */
api.get('/getUsuariosRolGestor', autenticacionToken.Auth, usuarioController.getUsuariosRoLGestor);
/* ver propio usuario por ID */
api.get('/getUsuarioRolGestor/:ID', autenticacionToken.Auth, usuarioController.getUsuarioIdRolGestor);



/* ---------- ADMINISTRACIÓN DEL ROL REPARTIDOR --------- */
//api.post ('/agregarRolRepartidor', autenticacionToken.Auth,  usuarioController.agregarRepartidor);
api.post('/agregarRolRepartidor', autenticacionToken.Auth,  MulterImagen.single('imagen'), usuarioController.agregarRepartidor);
// cambio
api.delete ('/eliminarRolRepartidor/:ID', autenticacionToken.Auth, usuarioController.eliminarUsuarioRolRepartidor);
api.put ('/editarRolRepartidor/:ID', autenticacionToken.Auth, usuarioController.editarUsuarioRolRepartidor);
api.get('/getUsuarioRolRepartidor', autenticacionToken.Auth, usuarioController.getUsuariosRolRepartidor);
api.get('/getUsuarioIdRolRepartidor/:ID', autenticacionToken.Auth, usuarioController.getUsuarioIdRolRepartidor);

//ROL CAJERO
 //api.post('/agregarRolCajero' , autenticacionToken.Auth, usuarioController.agregarUsuarioCajero);
 api.post('/agregarRolCajero', autenticacionToken.Auth,  MulterImagen.single('imagen'), usuarioController.agregarUsuarioCajero);
 api.put('/editarRolCajero/:ID', autenticacionToken.Auth , usuarioController.editarUsuarioCajero);
 api.delete('/eliminarRolCajero/:ID', autenticacionToken.Auth, usuarioController.eliminarUsuarioCajero);
 api.get ('/getRolCajero', autenticacionToken.Auth , usuarioController.getUsuarioCajero);
 api.get('/getRolIdCajero/:ID' , autenticacionToken.Auth ,usuarioController.getUsuarioIdCajero);

/* VER USUARIOS POR DEPARTAMENTO */
/* ROL GESTOR  */
api.get('/getGestorGuatemala', autenticacionToken.Auth, usuarioController.getGestorGuatemala);



/* ROL_CAJERO */
api.get('/getCajeroGuatemala', autenticacionToken.Auth, usuarioController.getCajeroGuatemala);
api.get('/getCajeroAltaVerapaz', autenticacionToken.Auth, usuarioController.getCajeroAltaVerapaz);
api.get('/getCajeroBajaVerapaz', autenticacionToken.Auth, usuarioController.getCajeroBajaVerapaz);


/*EDITAR PERFIL*/
api.put('/editarPerfilAdmin/:ID', autenticacionToken.Auth, MulterImagen.single('imagen'), usuarioController.editarPerfilAdmin);

api.put('/editarPerfilGestor/:ID', autenticacionToken.Auth, MulterImagen.single('imagen'), usuarioController.editarPerfilGestor);


api.put('/editarPerfilCliente/:ID', autenticacionToken.Auth, MulterImagen.single('imagen'), usuarioController.editarPerfilCliente);



api.put('/editarPerfilFacturador/:ID', autenticacionToken.Auth, MulterImagen.single('imagen'), usuarioController.editarPerfilFacturador);

api.put('/editarPerfilCajero/:ID' , autenticacionToken.Auth, MulterImagen.single('imagen'), usuarioController.editarPerfilCajero);


api.put('/editarPerfilRepartidor/:ID' , autenticacionToken.Auth, MulterImagen.single('imagen'), usuarioController.editarPerfilRepartidor);

//BUSQUEDA

api.post('/buscarUsuario', autenticacionToken.Auth, usuarioController.buscarUsuario);


// get repartidores de la sucursal
api.get('/getRepartidoresPorIdSucursal/:idSucursal', autenticacionToken.Auth, usuarioController.getRepartidoresPorIdSucursal);

api.get('/getRepartidoresOcupadosPorIdSucursal/:idSucursal', autenticacionToken.Auth, usuarioController.getRepartidoresOcupadosPorIdSucursal);



api.get('/getRepartidorId/:ID' , autenticacionToken.Auth ,usuarioController.getRepartidorId);


module.exports= api;