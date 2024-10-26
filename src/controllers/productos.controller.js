const Categorias = require('../models/categorias.model');
const Productos = require('../models/productos.model');
const Sucursales = require('../models/sucursales.model');
const mongoose = require('mongoose');

const Usuarios = require('../models/usuarios.model');

/*  SIN TOKEN */

function ObtenerProductosCualquiera(req, res) {
    Productos.find({ vendido: { $gt: 0 } }) // Filtra productos con vendido > 0
        .sort({ vendido: -1 }) // Ordena por vendido de mayor a menor
        .exec((err, productosEncontrados) => {
            if (err) return res.send({ mensaje: "Error: " + err });

            // Filtra productos únicos por nombreProducto
            const productosUnicos = [];
            const nombresVista = new Set();

            for (const producto of productosEncontrados) {
                if (!nombresVista.has(producto.nombreProducto)) {
                    nombresVista.add(producto.nombreProducto);
                    productosUnicos.push(producto);
                }
                // Limita el número de productos a 6
                if (productosUnicos.length === 6) break;
            }

            return res.send({ productos: productosUnicos });
        });
}

function agregarProductoRolGestor(req, res) {
    if (req.user.rol !== 'ROL_GESTOR') {
        return res.status(403).json({ mensaje: "Unicamente el ROL_GESTOR puede realizar esta acción" });
    }

    var parametros = req.body;
    const idSucursal = req.params.idSucursal;
    const idCategoria = req.params.idCategoria;

    // Aquí se obtiene la ruta de la imagen

    const imagenPath = req.file ? req.file.filename : null; // Solo el nombre del archivo


    // Validación de parámetros
    if (!parametros.nombreProducto || !parametros.marca ||
        !parametros.stock || !parametros.precio ||
        !parametros.descripcion || !parametros.size) {
        return res.status(400).json({ mensaje: 'Debe llenar los campos necesarios (nombreProducto, marca, descripción, stock, precio, size). Además, los campos no pueden ser vacíos' });
    }

    Categorias.findById(idCategoria, (err, categoriaEncontrada) => {
        if (err) {
            return res.status(500).json({ mensaje: 'Error en la petición de categoría' });
        }
        if (!categoriaEncontrada) {
            return res.status(404).json({ mensaje: 'Esta categoría no existe.' });
        }

        Sucursales.findById(idSucursal, (err, sucursalEncontrada) => {
            if (err) {
                return res.status(500).json({ mensaje: 'Error en la petición de sucursal' });
            }
            if (!sucursalEncontrada) {
                return res.status(404).json({ mensaje: 'Esta sucursal no existe.' });
            }

            var productosModel = new Productos();
            productosModel.nombreProducto = parametros.nombreProducto;
            productosModel.marca = parametros.marca;
            productosModel.stock = parametros.stock;
            productosModel.precio = parametros.precio;
            productosModel.descripcion = parametros.descripcion;
            productosModel.size = parametros.size;
            productosModel.estado = "disponible";
            productosModel.imagen = imagenPath; // Asignar la URL de la imagen aquí

            productosModel.descripcionCategoria = [{
                idCategoria: categoriaEncontrada._id,
                nombreCategoria: categoriaEncontrada.nombreCategoria
            }];

            productosModel.datosSucursal = [{
                idSucursal: sucursalEncontrada._id,
                nombreSucursal: sucursalEncontrada.nombreSucursal,
                direccionSucursal: sucursalEncontrada.direccionSucursal,
                telefonoSucursal: sucursalEncontrada.telefonoSucursal,
                departamento: sucursalEncontrada.departamento, // Asegúrate de que este campo exista
                municipio: sucursalEncontrada.municipio
            }];

            productosModel.save((err, productosGuardados) => {
                if (err) {
                    return res.status(500).json({ mensaje: 'Error al guardar el producto' });
                }
                if (!productosGuardados) {
                    return res.status(500).json({ mensaje: 'Error al agregar el producto' });
                }
                return res.status(200).json({ productos: productosGuardados });
            });
        });
    });
}
/* 
function agregarProductoRolAdmin(req, res) {
    if (req.user.rol !== 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción " });
    }
    var parametros = req.body;
    if (parametros.nombreProducto && parametros.marca &&
        parametros.stock && parametros.precio && parametros.descripcion && parametros.nombreCategoria &&
        parametros.nombreProducto != "" && parametros.marca != "" &&
        parametros.stock != "" && parametros.precio != "" && parametros.descripcion != "" && parametros.nombreCategoria != "") {
        Categorias.findOne({ nombreCategoria: parametros.nombreCategoria }, (err, categoriaEncontrada) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
            if (!categoriaEncontrada) return res.status(500).send({ mensaje: 'Esta Categoría no existe. Verifique el nombre' });
            var productosModel = new Productos();
            productosModel.nombreProducto = parametros.nombreProducto;
            productosModel.marca = parametros.marca;
            productosModel.stock = parametros.stock;
            productosModel.precio = parametros.precio;
            productosModel.descripcion = parametros.descripcion;
            productosModel.idCategoria = categoriaEncontrada._id;

            productosModel.save((err, productosGuardados) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                if (!productosGuardados) return res.status(500).send({ mensaje: 'Error al agregar la empresa' });
                return res.status(200).send({ productos: productosGuardados });
            });
        });
    } else {
        return res.status(500)
            .send({ mensaje: 'Debe llenar los campos necesarios (nombreProducto, marca, descripción, stock, precio y nombreCategoria). Además, los campos no pueden ser vacíos' });
    }
} */


function verProductosRolGestor(req, res) {

    if (req.user.rol !== 'ROL_GESTOR') {
        return res.status(403).send({ mensaje: "Unicamente el ROL_GESTOR puede realizar esta acción." });
    }

    const idSucursal = req.params.idSucursal; // ID de la sucursal desde la ruta
    const idCategoria = req.params.idCategoria; // ID de la categoría desde la ruta

    // Validar que se reciban ambos IDs
    if (!idSucursal || !idCategoria) {
        return res.status(400).send({ mensaje: 'Faltan el ID de la sucursal o el ID de la categoría.' });
    }

    // Verificar que los IDs sean válidos
    if (!mongoose.Types.ObjectId.isValid(idSucursal) || !mongoose.Types.ObjectId.isValid(idCategoria)) {
        return res.status(400).send({ mensaje: 'ID de sucursal o categoría inválido.' });
    }

    // Buscar si la sucursal y la categoría existen
    Promise.all([
        Sucursales.findById(idSucursal),
        Categorias.findById(idCategoria)
    ])
        .then(([sucursal, categoria]) => {
            if (!sucursal) {
                return res.status(404).send({ mensaje: 'Sucursal no encontrada.' });
            }
            if (!categoria) {
                return res.status(404).send({ mensaje: 'Categoría no encontrada.' });
            }

            // Buscar los productos por ID de sucursal y ID de categoría
            return Productos.find({
                'datosSucursal.idSucursal': idSucursal,
                'descripcionCategoria.idCategoria': idCategoria
            });
        })
        .then(productosEncontrados => {
            if (!productosEncontrados || productosEncontrados.length === 0) {
                return res.status(404).send({ mensaje: 'No se encontraron productos para la sucursal y categoría proporcionadas.' });
            }

            return res.status(200).send({ productos: productosEncontrados });
        })
        .catch(err => {
            return res.status(500).send({ mensaje: 'Error al buscar los productos.', error: err });
        });
}



function obtenerProductosPorIdCategoria(req, res) {

    if (req.user.rol !== 'ROL_GESTOR') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_GESTOR puede realizar esta acción" });
    }

    const idCategoria = req.params.ID; // ID de la categoría desde la ruta

    // Validar que se reciba el ID de la categoría
    if (!idCategoria) {
        return res.status(400).send({ mensaje: 'Falta el ID de la categoría.' });
    }

    // Buscar los productos por ID de categoría en el array descripcionCategoria
    Productos.find({ 'descripcionCategoria.idCategoria': idCategoria }, (err, productosEncontrados) => {
        if (err) return res.status(500).send({ mensaje: 'Error al buscar los productos.' });
        if (!productosEncontrados || productosEncontrados.length === 0) {
            return res.status(404).send({ mensaje: 'No se encontraron productos para la categoría proporcionada.' });
        }

        return res.status(200).send({ productos: productosEncontrados });
    });
}



function obtenerProductos(req, res) {
    if (req.user.rol !== 'ROL_GESTOR') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_GESTOR puede realizar esta acción" });
    }

    Productos.find((err, productosObtenidos) => {
        if (err) return res.send({ mensaje: "Error: " + err })

        return res.send({ productos: productosObtenidos })
        /* Esto retornara
            {
                productos: ["array con todos los productos"]
            }
        */
    })
}


/* ver productos rol admin */
function obtenerProductosRolAdmin(req, res) {
    if (req.user.rol !== 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción " });
    }

    Productos.find((err, productosEncontrados) => {

        if (err) return res.status(500).send({ mensaje: 'Error al buscar los productos' })
        if (!productosEncontrados) return res.status(500).send({ mensaje: 'No existen los productos' })

        return res.status(200).send({ productos: productosEncontrados })
    })
}


/* Editar productos solo el rol_gestor */
function editarProductosRolGestor(req, res) {
    if (req.user.rol !== 'ROL_GESTOR') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_GESTOR puede realizar esta acción" });
    }

    var parametros = req.body;
    var idProducto = req.params.ID;

    Productos.findByIdAndUpdate(idProducto, parametros, { new: true }, (err, productosEncontrados) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if (!productosEncontrados) return res.status(500).send({ mensaje: "Error al editar el producto" });
        return res.status(200).send({ productos: productosEncontrados });
    })
}



function eliminarProductosRolGestor(req, res) {
    if (req.user.rol !== 'ROL_GESTOR') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_GESTOR puede realizar esta acción" });
    }

    var idProducto = req.params.ID;
    Productos.findByIdAndDelete(idProducto, (err, eliminarProducto) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if (!eliminarProducto) return res.status(500).send({ mensaje: "Error al eliminar la Empresa" });
        return res.status(200).send({ productos: eliminarProducto });
    })
}



function verProductosPorId(req, res) {
    if (req.user.rol !== 'ROL_GESTOR') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_GESTOR puede realizar esta acción " });
    }
    var idProducto = req.params.ID;

    Productos.findById(idProducto, (err, productoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: "Error en la petición" });
        if (!productoEncontrado) return res.status(500).send({ mensaje: "Error al ver los productos" });
        return res.status(200).send({ productos: productoEncontrado });
    })

}


/* ROL CLIENTE */
function verProductosPorIdRolCliente(req, res) {
    if (req.user.rol !== 'ROL_CLIENTE') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_CLIENTE puede realizar esta acción " });
    }
    var idProducto = req.params.ID;

    Productos.findById(idProducto, (err, productoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: "Error en la petición" });
        if (!productoEncontrado) return res.status(500).send({ mensaje: "Error al ver los productos" });
        return res.status(200).send({ productos: productoEncontrado });
    })

}


/* TAREAS DEL ROL_CLIENTE */
function obtenerProductosPorIdSucursal(req, res) {

    if (req.user.rol !== 'ROL_CLIENTE') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_CLIENTE puede realizar esta acción" });
    }

    const idSucursal = req.params.ID; // ID de la categoría desde la ruta

    // Validar que se reciba el ID de la categoría
    if (!idSucursal) {
        return res.status(400).send({ mensaje: 'Falta el ID de la sucursal.' });
    }

    // Buscar los productos por ID de categoría en el array descripcionCategoria
    Productos.find({ 'datosSucursal.idSucursal': idSucursal }, (err, productosEncontrados) => {
        if (err) return res.status(500).send({ mensaje: 'Error al buscar los productos.' });
        if (!productosEncontrados || productosEncontrados.length === 0) {
            return res.status(404).send({ mensaje: 'No se encontraron productos para la sucursal proporcionada.' });
        }

        return res.status(200).send({ productos: productosEncontrados });
    });
}

/* VER PRODUCTOS EL ROL CLIENTE  */
function verProductosRolCliente(req, res) {

    if (req.user.rol !== 'ROL_CLIENTE') {
        return res.status(403).send({ mensaje: "Unicamente el ROL_CLIENTE puede realizar esta acción." });
    }

    const idSucursal = req.params.idSucursal; // ID de la sucursal desde la ruta
    const idCategoria = req.params.idCategoria; // ID de la categoría desde la ruta

    // Validar que se reciban ambos IDs
    if (!idSucursal || !idCategoria) {
        return res.status(400).send({ mensaje: 'Faltan el ID de la sucursal o el ID de la categoría.' });
    }

    // Verificar que los IDs sean válidos
    if (!mongoose.Types.ObjectId.isValid(idSucursal) || !mongoose.Types.ObjectId.isValid(idCategoria)) {
        return res.status(400).send({ mensaje: 'ID de sucursal o categoría inválido.' });
    }

    // Buscar si la sucursal y la categoría existen
    Promise.all([
        Sucursales.findById(idSucursal),
        Categorias.findById(idCategoria)
    ])
        .then(([sucursal, categoria]) => {
            if (!sucursal) {
                return res.status(404).send({ mensaje: 'Sucursal no encontrada.' });
            }
            if (!categoria) {
                return res.status(404).send({ mensaje: 'Categoría no encontrada.' });
            }

            // Buscar los productos por ID de sucursal y ID de categoría
            return Productos.find({
                'datosSucursal.idSucursal': idSucursal,
                'descripcionCategoria.idCategoria': idCategoria
            });
        })
        .then(productosEncontrados => {
            if (!productosEncontrados || productosEncontrados.length === 0) {
                return res.status(404).send({ mensaje: 'No se encontraron productos para la sucursal y categoría proporcionadas.' });
            }

            return res.status(200).send({ productos: productosEncontrados });
        })
        .catch(err => {
            return res.status(500).send({ mensaje: 'Error al buscar los productos.', error: err });
        });
}


// ver productos de mi sucursal inventario

function productosInventario(req, res) {
   

    const idSucursal = req.params.ID; // ID de la categoría desde la ruta

    // Validar que se reciba el ID de la categoría
    if (!idSucursal) {
        return res.status(400).send({ mensaje: 'Falta el ID de la sucursal.' });
    }

    // Buscar los productos por ID de categoría en el array descripcionCategoria
    Productos.find({ 'datosSucursal.idSucursal': idSucursal }, (err, productosEncontrados) => {
        if (err) return res.status(500).send({ mensaje: 'Error al buscar los productos.' });
        if (!productosEncontrados || productosEncontrados.length === 0) {
            return res.status(404).send({ mensaje: 'No se encontraron productos para la sucursal proporcionada.' });
        }

        return res.status(200).send({ productos: productosEncontrados });
    });

}


function obtenerProductosPorIdSucursalSinToken(req, res) {

   

    const idSucursal = req.params.ID; // ID de la categoría desde la ruta

    // Validar que se reciba el ID de la categoría
    if (!idSucursal) {
        return res.status(400).send({ mensaje: 'Falta el ID de la sucursal.' });
    }

    // Buscar los productos por ID de categoría en el array descripcionCategoria
    Productos.find({ 'datosSucursal.idSucursal': idSucursal }, (err, productosEncontrados) => {
        if (err) return res.status(500).send({ mensaje: 'Error al buscar los productos.' });
        if (!productosEncontrados || productosEncontrados.length === 0) {
            return res.status(404).send({ mensaje: 'No se encontraron productos para la sucursal proporcionada.' });
        }

        return res.status(200).send({ productos: productosEncontrados });
    });
}


function obtenerProductosDeMiSucu(req, res) {
    // Verificamos que el usuario tenga el rol adecuado
    if (req.user.rol !== 'ROL_GESTOR') {
        return res.status(403).send({ mensaje: "Unicamente el ROL_GESTOR puede realizar esta acción" });
    }

    // Obtenemos el idSucursal del usuario
    const idSucursal = req.user.idSucursal;

    // Buscamos los productos que pertenecen a la sucursal del usuario
    Productos.find({ idSucursal: idSucursal }, (err, productosObtenidos) => {
        if (err) {
            return res.status(500).send({ mensaje: "Error: " + err });
        }

        // Retornamos los productos obtenidos
        return res.send({ productos: productosObtenidos });
        /* Esto retornara
            {
                productos: ["array con los productos de la sucursal"]
            }
        */
    });
}


function obtenerUsuariosSucursal(req, res) {
    // Obtenemos el idSucursal desde los parámetros de la ruta
    const idSucursal = req.params.idSucursal;

    // Verificamos que el idSucursal no esté vacío
    if (!idSucursal) {
        return res.status(400).send({ mensaje: "ID de sucursal no proporcionado" });
    }

    // Definimos los roles que queremos filtrar
    const rolesPermitidos = ['ROL_GESTOR', 'ROL_FACTURADOR', 'ROL_REPARTIDOR'];

    // Buscamos los usuarios que coincidan con el idSucursal y los roles permitidos
    Usuarios.find({ 
        idSucursal: idSucursal, 
        rol: { $in: rolesPermitidos } 
    })
    .sort({ rol: 1 }) // Ordenar por rol
    .exec((err, usuariosObtenidos) => {
        if (err) {
            return res.status(500).send({ mensaje: "Error: " + err });
        }

        // Retornamos los usuarios obtenidos
        return res.send({ usuarios: usuariosObtenidos });
    });
}

module.exports = {
    agregarProductoRolGestor,
    verProductosRolGestor,
    obtenerProductosPorIdCategoria,
    obtenerProductos,
    obtenerProductosRolAdmin,
    editarProductosRolGestor,
    eliminarProductosRolGestor,
    verProductosPorId,
    obtenerProductosPorIdSucursal,
    verProductosPorIdRolCliente,
    verProductosRolCliente,
    ObtenerProductosCualquiera,
    productosInventario,
    obtenerProductosPorIdSucursalSinToken,
    obtenerProductosDeMiSucu,
    obtenerUsuariosSucursal

}