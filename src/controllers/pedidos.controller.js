const Pedidos = require('../models/pedidos.model');
const Carritos = require('../models/carritos.model');
const Usuarios = require('../models/usuarios.model');
const Productos = require('../models/productos.model');
const Efectivo = require('../models/efectivo.model');

/* OBTENER TODOS LOS PEDIDOS */
function ObtenerTodosLosPedidos (req, res) {

    if (req.user.rol !== 'ROL_CAJERO') {
        return res.status(500).send({ mensaje: "Únicamente el ROL_CAJERO puede realizar esta acción." });
    }

    Pedidos.find({ estadoPedido: "En espera" },(err, pedidosEncontrados) => {
        if (err) return res.send({ mensaje: "Error: " + err })

        return res.send({ pedidos: pedidosEncontrados })
        /* Esto retornara
            {
                productos: ["array con todos los productos"]
            }
        */ 
    })
}

function pedidoEnEsperaCredito(req, res) {
    if (req.user.rol !== 'ROL_CAJERO') {
        return res.status(500).send({ mensaje: "Únicamente el ROL_CAJERO puede realizar esta acción." });
    }

    const idSucursal = req.params.idSucursal; // Obtener idSucursal desde los parámetros de la solicitud

    Pedidos.find({
        estadoPedido: "sin confirmar",
        tipoPago: "Tarjeta de crédito",
        pagoConfirmado: "sin confirmar",
        "compras.datosSucursal.idSucursal": idSucursal, // Filtrar por idSucursal
        tipoPago: "Tarjeta de crédito" // Filtrar por tipo de pago
    }, (err, pedidosEncontrados) => {
        if (err) return res.send({ mensaje: "Error: " + err });

        return res.send({ pedidos: pedidosEncontrados });
    });
}




function pedidoConfirmadoCredito(req, res) {
    if (req.user.rol !== 'ROL_CAJERO') {
        return res.status(500).send({ mensaje: "Únicamente el ROL_CAJERO puede realizar esta acción." });
    }

    const idSucursal = req.params.idSucursal; // Obtener idSucursal desde los parámetros de la solicitud

    Pedidos.find({
        estadoPedido: "confirmado",
        tipoPago: "Tarjeta de crédito",
        pagoConfirmado: "pago confirmado",
        "compras.datosSucursal.idSucursal": idSucursal, // Filtrar por idSucursal
        tipoPago: "Tarjeta de crédito" // Filtrar por tipo de pago
    }, (err, pedidosEncontrados) => {
        if (err) return res.send({ mensaje: "Error: " + err });

        return res.send({ pedidos: pedidosEncontrados });
    });
}


/* OBTENER PEDIDO DE CLIENTE REGISTRADO */
function verPedidosClienteRegistrado(req, res) {
    // Verifica si el usuario está autenticado
    if (req.user.rol !== 'ROL_CLIENTE') {
        return res.status(500).send({ mensaje: "Únicamente el ROL_CLIENTE puede realizar esta acción." });
    }

    // Busca los pedidos del usuario con estadoPedido confirmado
    Pedidos.find({ 
        idUsuario: req.user.sub, 
        estadoPedido: 'confirmado',
        tipoPago: 'Tarjeta de crédito',
    }, (err, pedidosEncontrados) => {
        if (err) return res.status(500).send({ mensaje: "Error en la petición." });
        if (!pedidosEncontrados || pedidosEncontrados.length === 0) {
            return res.status(404).send({ mensaje: "No se encontraron pedidos confirmados para este cliente." });
        }
        return res.status(200).send({ pedidos: pedidosEncontrados });
    });
}

function verPedidosConfirmadosEfectivo(req, res) {
    // Verifica si el usuario está autenticado
    if (req.user.rol !== 'ROL_CLIENTE') {
        return res.status(500).send({ mensaje: "Únicamente el ROL_CLIENTE puede realizar esta acción." });
    }

    // Busca los pedidos del usuario con estadoPedido confirmado
    Pedidos.find({ 
        idUsuario: req.user.sub, 
        estadoPedido: 'confirmado',
        tipoPago: 'Efectivo',
    }, (err, pedidosEncontrados) => {
        if (err) return res.status(500).send({ mensaje: "Error en la petición." });
        if (!pedidosEncontrados || pedidosEncontrados.length === 0) {
            return res.status(404).send({ mensaje: "No se encontraron pedidos confirmados para este cliente." });
        }
        return res.status(200).send({ pedidos: pedidosEncontrados });
    });
}

function verPedidosSinConfirmarCliente(req, res) {
    // Verifica si el usuario está autenticado
    if (req.user.rol !== 'ROL_CLIENTE') {
        return res.status(500).send({ mensaje: "Únicamente el ROL_CLIENTE puede realizar esta acción." });
    }

    // Busca los pedidos del usuario con estadoPedido confirmado
    Pedidos.find({ 
        idUsuario: req.user.sub, 
        estadoPedido: 'sin confirmar' 
    }, (err, pedidosEncontrados) => {
        if (err) return res.status(500).send({ mensaje: "Error en la petición." });
        if (!pedidosEncontrados || pedidosEncontrados.length === 0) {
            return res.status(404).send({ mensaje: "No se encontraron pedidos confirmados para este cliente." });
        }
        return res.status(200).send({ pedidos: pedidosEncontrados });
    });
}

/* GENERAR PEDIDO OVERALL */
function generarPedido(req, res) {
    if (req.user.rol !== 'ROL_CLIENTE') {
        return res.status(500).send({ mensaje: "Únicamente el ROL_CLIENTE puede realizar esta acción." });
    }

    const idCarrito = req.params.idCarrito; 
    const { tipoPago, direccionEnvio, municipioPedido, horaEntrega } = req.body; 

    // Buscar el carrito del usuario
    Carritos.findById(idCarrito, (err, carritoEncontrado) => {
        if (err || !carritoEncontrado) {
            return res.status(404).send({ mensaje: 'Carrito no encontrado' });
        }

        // Verificar que el carrito tenga al menos un producto y que el total sea igual o mayor a 100
        if (carritoEncontrado.compras.length === 0) {
            return res.status(400).send({ mensaje: 'El carrito debe tener al menos un producto para generar un pedido.' });
        }
        if (carritoEncontrado.total < 100) {
            return res.status(400).send({ mensaje: 'El total del carrito debe ser igual o mayor a 100.' });
        }

        // Verificar si ya hay pedidos sin confirmar para el usuario
        Pedidos.countDocuments({ idUsuario: req.user.sub, estadoPedido: 'sin confirmar' }, (err, count) => {
            if (err) return res.status(500).send({ mensaje: 'Error al contar los pedidos' });
            if (count > 0) {
                return res.status(400).send({ mensaje: 'No puedes generar un nuevo pedido mientras haya pedidos sin confirmar.' });
            }

            // Obtener datos del usuario
            Usuarios.findById(req.user.sub, (err, usuario) => {
                if (err) return res.status(500).send({ mensaje: "Error al obtener datos del usuario" });
                if (!usuario) return res.status(404).send({ mensaje: "Usuario no encontrado" });

                // Ajustar el total y el incremento de envío si el método de envío es "moto"
                let totalPedido = carritoEncontrado.total;
                const metodoEnvio = "moto"; // Asignar el método de envío
                let incrementoEnvio = 0; // Inicializar el incremento de envío
                
                if (metodoEnvio === "moto") {
                    // Cambiar el incremento de envío basado en el total del carrito
                    if (totalPedido >= 400) {
                        incrementoEnvio = 0; // Si el total es 400 o más, incremento de envío es 0
                    } else {
                        incrementoEnvio = 10; // Si el total es menor a 400, incremento de envío es 10
                    }
                    totalPedido += incrementoEnvio; // Incrementar el total
                }

                // Extraer el departamento del primer elemento de datosSucursal
                const departamento = carritoEncontrado.compras[0]?.datosSucursal[0]?.departamento || null; // Asumir el primer dato

                // Crear el nuevo pedido
                const nuevoPedido = new Pedidos({
                    idUsuario: usuario._id,
                    fecha: new Date(),
                    tiempoEstimado: '30-45 minutos',
                    tipoPago: tipoPago,
                    estadoPedido: 'sin confirmar',
                    direccionEnvio: direccionEnvio,
                    horaEntrega: horaEntrega,
                    metodoEnvio: metodoEnvio,
                    descuentos: null,
                    numeroDeOrden: 0, // Mantener en 0
                    pagoConfirmado: 'sin confirmar',
                    incrementoEnvio: incrementoEnvio,
                    departamentoPedido: departamento,
                    municipioPedido: municipioPedido,
                    /* nuevos campos */
                    estadoOrden: "no asignado",

                    horaRepartidorAsignado: null,
                    horaPedidoEntregado: null,
                    datosUsuario: [{
                        idUsuario: usuario._id,
                        nombre: usuario.nombre, 
                        apellido: usuario.apellido,
                        email: usuario.email,
                        telefono: usuario.telefono 
                    }],
                    compras: carritoEncontrado.compras,
                    total: totalPedido
                });

                // Guardar el nuevo pedido directamente
                nuevoPedido.save((err, pedidoGuardado) => {
                    if (err) return res.status(500).send({ mensaje: 'Error al guardar el pedido' });

                    // Vaciar el carrito después de generar el pedido
                    Carritos.findByIdAndUpdate(idCarrito, { compras: [], total: 0 }, { new: true }, (err, carritoActualizado) => {
                        if (err) return res.status(500).send({ mensaje: 'Error al vaciar el carrito' });

                        // Solo se actualizará el stock si el estado es "confirmado"
                        if (nuevoPedido.estadoPedido === 'confirmado') {
                            const updatesStock = pedidoGuardado.compras.map(compra => {
                                return Productos.findByIdAndUpdate(compra.idProducto, {
                                    $inc: { stock: -compra.cantidad }
                                });
                            });

                            // Ejecutar todas las actualizaciones de stock
                            Promise.all(updatesStock)
                                .then(() => {
                                    return res.status(200).send({ mensaje: 'Pedido generado con éxito', pedido: pedidoGuardado, carrito: carritoActualizado });
                                })
                                .catch(err => {
                                    return res.status(500).send({ mensaje: 'Error al actualizar el stock de los productos' });
                                });
                        } else {
                            return res.status(200).send({ mensaje: 'Pedido generado con éxito, pero el stock no se ha actualizado hasta que el pedido sea confirmado.', pedido: pedidoGuardado, carrito: carritoActualizado });
                        }
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


// que el cajero asigne el pedido al repartidor
function asignarPedidoRepartidor(req, res) {
    if (req.user.rol !== 'ROL_CAJERO') {
        return res.status(500).send({ mensaje: "Únicamente el ROL_CAJERO puede realizar esta acción." });
    }

    const { email, numeroDeOrden } = req.body;

    // Verificar que el número de orden y el email del repartidor estén presentes
    if (!numeroDeOrden || !email) {
        return res.status(400).send({ mensaje: 'El número de orden y el email del repartidor son requeridos.' });
    }

    // Buscar el pedido por numeroDeOrden
    Pedidos.findOne({ numeroDeOrden: numeroDeOrden }, (err, pedidoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error al buscar el pedido.' });
        if (!pedidoEncontrado) return res.status(404).send({ mensaje: 'Pedido no encontrado.' });

        // Verificar el estado del pedido
        if (pedidoEncontrado.estadoOrden !== 'preparando su pedido') {
            return res.status(400).send({ mensaje: 'El pedido debe estar en estado "preparando su pedido" para asignar un repartidor.' });
        }

        // Verificar si ya hay un repartidor asignado al pedido
        if (pedidoEncontrado.repartidorAsignado.length > 0) {
            return res.status(400).send({ mensaje: 'Este pedido ya tiene un repartidor asignado.' });
        }

        // Buscar los datos del repartidor por email
        Usuarios.findOne({ email: email }, (err, repartidor) => {
            if (err) return res.status(500).send({ mensaje: 'Error al buscar el repartidor.' });
            if (!repartidor) return res.status(404).send({ mensaje: 'Repartidor no encontrado.' });

            // Verificar el estado del repartidor
            if (repartidor.estadoRepartidor === 'ocupado') {
                return res.status(400).send({ mensaje: 'El repartidor está ocupado y no puede ser asignado.' });
            }

            // Llenar los datos del repartidor en el pedido
            pedidoEncontrado.repartidorAsignado.push({
                idRepartidor: repartidor._id,
                nombre: repartidor.nombre,
                apellido: repartidor.apellido,
                email: repartidor.email,
                telefono: repartidor.telefono,
                rol: repartidor.rol,
                estadoRepartidor: 'ocupado' // Cambiar estadoRepartidor a ocupado
            });

            // Actualizar el estado del repartidor
            repartidor.estadoRepartidor = 'ocupado';
            repartidor.save((err) => {
                if (err) return res.status(500).send({ mensaje: 'Error al actualizar el estado del repartidor.' });

                // Actualizar el pedido
                pedidoEncontrado.estadoOrden = 'en camino'; // Cambiar estadoOrden a en camino
                pedidoEncontrado.horaRepartidorAsignado = new Date(); // Asignar hora actual

                // Guardar los cambios en el pedido
                pedidoEncontrado.save((err, pedidoActualizado) => {
                    if (err) return res.status(500).send({ mensaje: 'Error al actualizar el pedido.' });

                    return res.status(200).send({ mensaje: 'Repartidor asignado con éxito', pedido: pedidoActualizado });
                });
            });
        });
    });
}

/* obtener pedidos por id sucursal, el cajero los vera en base a su sucursal jajaj */

function obtenerPedidosPorIdSucursal(req, res) {

    if (req.user.rol !== 'ROL_CAJERO') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_CAJERO puede realizar esta acción" });
    }

    const idSucursal = req.params.ID; // ID de la categoría desde la ruta

    // Validar que se reciba el ID de la categoría
    if (!idSucursal) {
        return res.status(400).send({ mensaje: 'Falta el ID de la sucursal.' });
    }

    // Buscar los productos por ID de categoría en el array descripcionCategoria
    Pedidos.find({ 'compras.datosSucursal.idSucursal': idSucursal }, (err, pedidoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error al buscar los pedidos.' });
        if (!pedidoEncontrado || pedidoEncontrado.length === 0) {
            return res.status(404).send({ mensaje: 'No se encontraron pedidos para la sucursal proporcionada.' });
        }

        return res.status(200).send({ pedidos: pedidoEncontrado });
    });
}

/* obtener pedido de usuario y solo en espera */
function pedidoClienteSinConfirmar(req, res) {
    if (req.user.rol !== 'ROL_CLIENTE') {
        return res.status(500).send({ mensaje: "Únicamente el ROL_CLIENTE puede realizar esta acción." });
    }

    Pedidos.find({
        datosUsuario: { $elemMatch: { idUsuario: req.user.sub } },
        
        tipoPago: "Tarjeta de crédito",
        estadoPedido: "sin confirmar",  // Agregar el filtro para el estado del pedido
    }, (err, pedidosEncontrados) => {
        if (err) return res.status(500).send({ mensaje: "Error en la petición." });
        if (!pedidosEncontrados || pedidosEncontrados.length === 0) {
            return res.status(404).send({ mensaje: "No se encontraron pedidos en espera para este cliente." });
        }
        return res.status(200).send({ pedidos: pedidosEncontrados });
    });
}

/* editar el pedido */ 

function editarPedidosRolCajero(req, res) {
    if (req.user.rol !== 'ROL_CAJERO') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_CAJERO puede realizar esta acción" });
    }

    var parametros = req.body;
    var idPedido = req.params.ID;

    Pedidos.findByIdAndUpdate(idPedido, parametros, { new: true }, (err, pedidosEncontrados) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if (!pedidosEncontrados) return res.status(500).send({ mensaje: "Error al editar el pedido" });
        return res.status(200).send({ pedidos: pedidosEncontrados });
    })
}


function getPedidoPorId(req, res) {
    if (req.user.rol !== 'ROL_CAJERO') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_CAJERO puede realizar esta acción" });
    }
  
    // buscar por id
    var IdPedido = req.params.ID;
  
    Pedidos.findById(IdPedido, (err, pedidoEncontrado) => {
      if (err) return res.status(500).send({ mensaje: "Error en la petición" });
      if (!pedidoEncontrado) return res.status(500).send({ mensaje: "Error al ver el pedido" });
      return res.status(200).send({ pedidos: pedidoEncontrado })
    })
  }


  function confirmarPedidoEfectivo(req, res) {
    if (req.user.rol !== 'ROL_CLIENTE') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_CLIENTE puede realizar esta acción" });
    }
    
    const { efectivoCliente, nit } = req.body; // El efectivo y el NIT que ingresa el cliente

    // Buscar un pedido con tipoPago "Efectivo" y estadoPedido "sin confirmar"
    Pedidos.findOne({ tipoPago: 'Efectivo', estadoPedido: 'sin confirmar' }, (err, pedido) => {
        if (err) return res.status(500).send({ mensaje: 'Error al buscar el pedido' });
        if (!pedido) return res.status(404).send({ mensaje: 'No hay pedidos sin confirmar con pago en efectivo' });

        // Validar que el efectivoCliente sea mayor o igual que el totalPedido
        if (efectivoCliente < pedido.total) {
            return res.status(400).send({ mensaje: 'El efectivo debe ser mayor o igual al total del pedido' });
        }

        // Calcular el cambio
        const cambioCliente = efectivoCliente > pedido.total ? efectivoCliente - pedido.total : 0;

        // Crear un nuevo registro en el array de pagoEfectivo
        const nuevoPagoEfectivo = {
            efectivoCliente,
            cambioCliente,
            totalPedido: pedido.total, // Autocompletar totalPedido
            nit // Agregar el campo NIT
        };

        // Actualizar el pedido
        pedido.pagoEfectivo.push(nuevoPagoEfectivo);
        pedido.estadoPedido = 'confirmado';

        // Asignar el número de orden
        Pedidos.findOne().sort({ numeroDeOrden: -1 }).exec((err, ultimoPedido) => {
            if (err) return res.status(500).send({ mensaje: 'Error al obtener el último pedido' });
            pedido.numeroDeOrden = ultimoPedido ? ultimoPedido.numeroDeOrden + 1 : 1;

            // Guardar el pedido actualizado
            pedido.save((err, pedidoActualizado) => {
                if (err) return res.status(500).send({ mensaje: 'Error al actualizar el pedido' });

                return res.status(200).send({ mensaje: 'Pedido confirmado con éxito', pedido: pedidoActualizado });
            });
        });
    });
}

function pedidoClienteEfectivoSinConfirmar(req, res) {
    if (req.user.rol !== 'ROL_CLIENTE') {
        return res.status(500).send({ mensaje: "Únicamente el ROL_CLIENTE puede realizar esta acción." });
    }

    Pedidos.find({
        datosUsuario: { $elemMatch: { idUsuario: req.user.sub } },
        
        tipoPago: "Efectivo",
        estadoPedido: "sin confirmar",  // Agregar el filtro para el estado del pedido
    }, (err, pedidosEncontrados) => {
        if (err) return res.status(500).send({ mensaje: "Error en la petición." });
        if (!pedidosEncontrados || pedidosEncontrados.length === 0) {
            return res.status(404).send({ mensaje: "No se encontraron pedidos en espera para este cliente." });
        }
        return res.status(200).send({ pedidos: pedidosEncontrados });
    });
}



module.exports = {

    generarPedido,
    verPedidosCliente,
    eliminarPedido,
    ObtenerTodosLosPedidos,
    verPedidosClienteRegistrado,
    asignarPedidoRepartidor,
    obtenerPedidosPorIdSucursal,
    pedidoClienteSinConfirmar,
    pedidoEnEsperaCredito,
    verPedidosSinConfirmarCliente,
    pedidoConfirmadoCredito,
    editarPedidosRolCajero,
    getPedidoPorId,
    confirmarPedidoEfectivo,
    pedidoClienteEfectivoSinConfirmar,
    verPedidosConfirmadosEfectivo
}
