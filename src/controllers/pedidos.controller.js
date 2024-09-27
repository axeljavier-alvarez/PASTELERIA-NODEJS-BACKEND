const Pedidos = require('../models/pedidos.model');
const Carritos = require('../models/carritos.model');
const Usuarios = require('../models/usuarios.model');
const Productos = require('../models/productos.model');

/* GENERAR PEDIDO OVERALL */
function generarPedido(req, res) {
 
    if (req.user.rol !== 'ROL_CLIENTE') {
        return res.status(500).send({ mensaje: "Únicamente el ROL_CLIENTE puede realizar esta acción." });
    }
    
    const idCarrito = req.params.idCarrito; 
    const { tipoPago, direccionEnvio, fechaEntrega, metodoEnvio } = req.body; 

    // Buscar el carrito del usuario
    Carritos.findById(idCarrito, (err, carritoEncontrado) => {
        if (err || !carritoEncontrado) {
            return res.status(404).send({ mensaje: 'Carrito no encontrado' });
        }

        // Obtener datos del usuario
        Usuarios.findById(req.user.sub, (err, usuario) => {
            if (err) return res.status(500).send({ mensaje: "Error al obtener datos del usuario" });
            if (!usuario) return res.status(404).send({ mensaje: "Usuario no encontrado" });

            // Crear el nuevo pedido
            const nuevoPedido = new Pedidos({
                fecha: new Date(), // Fecha actual
                tiempoEstimado: '30-45 minutos', // Establecer un tiempo estimado por defecto
                tipoPago: tipoPago,
                estado: 'En espera',
                direccionEnvio: direccionEnvio,
                fechaEntrega: fechaEntrega,
                horaEntrega: null,
                metodoEnvio: metodoEnvio,
                descuentos: null,
                numeroDeOrden: 0,
                pagoConfirmado: null,
                datosUsuario: [{
                    idUsuario: usuario._id,
                    nombre: usuario.nombre, 
                    apellido: usuario.apellido,
                    email: usuario.email,
                    telefono: usuario.telefono 
                }],
                compras: carritoEncontrado.compras,
                total: carritoEncontrado.total
            });

            // Generar el número de orden automáticamente
            Pedidos.countDocuments({}, (err, count) => {
                if (err) return res.status(500).send({ mensaje: 'Error al contar los pedidos' });
                nuevoPedido.numeroDeOrden = count + 1; // Sumar 1 al contador para el nuevo número de orden

                nuevoPedido.save((err, pedidoGuardado) => {
                    if (err) return res.status(500).send({ mensaje: 'Error al guardar el pedido' });

                    // IMPORTANTE YA QUE REDUCE EL STOCK DE LA COLECCIÓN PRODUCTOS
                    const updatesStock = carritoEncontrado.compras.map(compra => {
                        return Productos.findByIdAndUpdate(compra.idProducto, {
                            $inc: { stock: -compra.cantidad } // Disminuir el stock por la cantidad del pedido
                        });
                    });

                    // Ejecutar todas las actualizaciones de stock
                    Promise.all(updatesStock)
                        .then(() => {
                            // Vaciar el carrito después de generar el pedido
                            Carritos.findByIdAndUpdate(idCarrito, { compras: [], total: 0 }, { new: true }, (err, carritoActualizado) => {
                                if (err) return res.status(500).send({ mensaje: 'Error al vaciar el carrito' });

                                return res.status(200).send({ mensaje: 'Pedido generado con éxito', pedido: pedidoGuardado, carrito: carritoActualizado });
                            });
                        })
                        .catch(err => {
                            return res.status(500).send({ mensaje: 'Error al actualizar el stock de los productos' });
                        });
                });
            });
        });
    });
}

/* VER LOS PEDIDOS DEL CLIENTE QUE LOS GENERO */
function verPedidosCliente(req, res) {

    if (req.user.rol !== 'ROL_CLIENTE') {
        return res.status(500).send({ mensaje: "Únicamente el ROL_CLIENTE puede realizar esta acción." });
    }

    Pedidos.find({ datosUsuario: { $elemMatch: { idUsuario: req.user.sub } } }, (err, pedidosEncontrados) => {
        if (err) return res.status(500).send({ mensaje: "Error en la petición." });
        if (!pedidosEncontrados || pedidosEncontrados.length === 0) {
            return res.status(404).send({ mensaje: "No se encontraron pedidos para este cliente" });
        }
        return res.status(200).send({ pedidos: pedidosEncontrados });
    });
}

/* ELIMINAR PEDIDO Y REGRESAR EL STOCK A DONDE CORRESPONDE EN CADA PRODUCTO */
function eliminarPedido(req, res) {
    /* ELIMINAR EL PEDIDO */
    if (req.user.rol !== 'ROL_CLIENTE') {
        return res.status(500).send({ mensaje: "Únicamente el ROL_CLIENTE puede realizar esta acción." });
    }
      
    const idPedido = req.params.idPedido;

    // Buscar el pedido por ID
    Pedidos.findById(idPedido, (err, pedidoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error al buscar el pedido' });
        if (!pedidoEncontrado) return res.status(404).send({ mensaje: 'Pedido no encontrado' });

        // Recuperar las compras del pedido para restaurar el stock
        const updatesStock = pedidoEncontrado.compras.map(compra => {
            return Productos.findByIdAndUpdate(compra.idProducto, {
                $inc: { stock: compra.cantidad } // Restaurar el stock
            });
        });

        // Ejecutar todas las actualizaciones de stock
        Promise.all(updatesStock)
            .then(() => {
                // Eliminar el pedido
                Pedidos.findByIdAndDelete(idPedido, (err) => {
                    if (err) return res.status(500).send({ mensaje: 'Error al eliminar el pedido' });
                    return res.status(200).send({ mensaje: 'Pedido eliminado y stock restaurado con éxito' });
                });
            })
            .catch(err => {
                return res.status(500).send({ mensaje: 'Error al restaurar el stock de los productos' });
            });
    });
}


module.exports = {

    generarPedido,
    verPedidosCliente,
    eliminarPedido
}
