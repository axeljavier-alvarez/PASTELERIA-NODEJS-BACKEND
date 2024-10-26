

const Facturas = require('../models/facturas.model');
const Carritos = require('../models/carritos.model');
const Productos = require('../models/productos.model');
const Usuarios = require('../models/usuarios.model');
const Pedidos = require('../models/pedidos.model');
const Tarjetas = require('../models/tarjetas.model');
const Caja = require('../models/caja.model');
const Sucursales = require('../models/sucursales.model');

// const GenerarPDF = require('../generarPDF/generarPDF');
function verFacturaPorPedido(req, res) {
    if (req.user.rol !== 'ROL_CLIENTE') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_CLIENTE puede realizar esta acción " });
    }

    const idPedido = req.params.idPedido;

    Facturas.find({
        "datosPedido.idPedido": idPedido,
    }, (err, facturasEncontradas) => {
        if (err) return res.send({ mensaje: "Error: " + err });

        return res.send({ facturas: facturasEncontradas });
    });
}

function GenerarFactura(req, res) {
    var parametros = req.body;
    if (req.user.rol !== 'ROL_CLIENTE') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_CLIENTE puede realizar esta acción " });
    }

    Carritos.findOne({ idUsuario: req.user.sub }, (err, carritoUsuario) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
        if (!carritoUsuario) return res.status(500).send({ mensaje: "El usuario no posee carritos, no puede acceder a crear facturas, debe crear un carrito" })
        if (carritoUsuario.compras.length == 0) return res.status(500).send({ mensaje: "No existen productos en el carrito del usuario " })


        if (!parametros.nit || parametros.nit == "") {
            return res.status(500).send({ mensaje: "Debe llenar el campo nit para generar la factura" })
        } else {


            for (let i = 0; i < carritoUsuario.compras.length; i++) {
                //console.log("ENtra a ford ")
                Productos.findOne({ _id: carritoUsuario.compras[i].idProducto }, (err, productoVerificacion) => {
                    if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
                    if (!carritoUsuario) return res.status(500).send({ mensaje: "Busqeuda de producto inexistente" })

                    if (carritoUsuario.compras[i].cantidad > productoVerificacion.stock) {
                        //console.log("PROCESO ANULADO ")


                        return res.status(500).send({
                            factura: "PROCESO DE FACTURACIÓN ANULADO", advertencia: "Su carrito posee el producto " +
                                carritoUsuario.compras[i].nombreProducto + " con una cantidad mayor al stock actual. ",
                            mensaje: "Debe editar la cantidad de su carrito o eliminar el producto de su compra para generar una nueva factura."
                        })
                    } else {


                        if (carritoUsuario.idUsuario == req.user.sub) {

                            var restarStock = (carritoUsuario.compras[i].cantidad * -1)
                            ////console.log(restarStock)
                            var cantidadVendido = carritoUsuario.compras[i].cantidad
                            Productos.findByIdAndUpdate(carritoUsuario.compras[i].idProducto, { $inc: { stock: restarStock, vendido: cantidadVendido } }, { new: true },
                                (err, productoModificado) => {
                                    if (!productoModificado) return res.status(500).send({ mensaje: 'Error al editar editar productos' });
                                    if (err) return res.status(500).send({ mensaje: "Error en la peticion" })


                                })


                        } else {
                            return res.status(200).send({ mensaje: "Verifique los datos de su carrito", })
                        }
                    }

                })

            }

            const modelFactura = new Facturas()
            modelFactura.nit = parametros.nit
            modelFactura.fecha = (new Date())
            modelFactura.compras = carritoUsuario.compras
            modelFactura.total = carritoUsuario.total
            modelFactura.idUsuario = req.user.sub
            let limpiarCarrito = []
            Carritos.findOneAndUpdate({ _id: carritoUsuario._id }, { compras: limpiarCarrito, total: 0 }, { new: true },
                (err, carritoVacio) => {

                    modelFactura.save((err, agregarFactura) => {

                        if (err) return res.status(500).send({ mensaje: "Erro, no se puede guardar el carrito" })
                        if (!agregarFactura) return res.status(500).send({ mensaje: "No se puede guardar el carrito" })


                    })
                })

        }

    })
}

//esta es la que funciona
/* function CrearFacturaCliente(req, res) {
    const parametros = req.body;
    if (req.user.rol !== 'ROL_CLIENTE') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_CLIENTE puede realizar esta acción" });
    }

    Carritos.findOne({ idUsuario: req.user.sub }, (err, carritoUsuario) => {
        if (err) return res.status(500).send({ mensaje: "Error en la petición" });
        if (!carritoUsuario) return res.status(500).send({ mensaje: "El usuario no posee carritos, no puede acceder a crear facturas, debe crear un carrito" });
        if (carritoUsuario.compras.length === 0) return res.status(500).send({ mensaje: "No existen productos en el carrito del usuario" });

        if (!parametros.nit || parametros.nit === "") {
            return res.status(500).send({ mensaje: "Debe llenar el campo nit para generar la factura" });
        }

        let productosValidos = true; // Variable para controlar si todos los productos son válidos
        const updates = []; // Array para almacenar las promesas de actualización de stock

        // Verificar stock de los productos
        for (let i = 0; i < carritoUsuario.compras.length; i++) {
            const productoId = carritoUsuario.compras[i].idProducto;
            const cantidad = carritoUsuario.compras[i].cantidad;

            // Verificar el stock del producto
            const verificacion = Productos.findOne({ _id: productoId }).exec();
            updates.push(verificacion); // Guardamos la promesa

            verificacion.then(productoVerificacion => {
                if (!productoVerificacion || cantidad > productoVerificacion.stock) {
                    productosValidos = false; // Hay un problema con el stock
                    res.status(500).send({
                        factura: "PROCESO DE FACTURACIÓN ANULADO",
                        advertencia: "Su carrito posee el producto " + carritoUsuario.compras[i].nombreProducto + " con una cantidad mayor al stock actual.",
                        mensaje: "Debe editar la cantidad de su carrito o eliminar el producto de su compra para generar una nueva factura."
                    });
                }
            });
        }

        // Cuando todas las verificaciones de stock se completen
        Promise.all(updates).then(() => {
            if (!productosValidos) return; // Si hubo un problema, no continuamos

            // Obtener datos del usuario
            Usuarios.findById(req.user.sub, (err, usuario) => {
                if (err) return res.status(500).send({ mensaje: "Error al obtener datos del usuario" });
                if (!usuario) return res.status(500).send({ mensaje: "Usuario no encontrado" });

                // Crear una nueva factura
                const modelFactura = new Facturas();
                modelFactura.nit = parametros.nit;
                modelFactura.fecha = new Date();
                modelFactura.datosUsuario = [{
                    idUsuario: usuario._id,
                    nombre: usuario.nombre,
                    apellido: usuario.apellido,
                    email: usuario.email
                }];
                
                // Agregar solo los productos del carrito a la factura
                modelFactura.compras = carritoUsuario.compras;
                modelFactura.total = carritoUsuario.total;

                // Actualizar el stock de los productos y generar la factura
                const updatesStock = carritoUsuario.compras.map(compra => {
                    return Productos.findByIdAndUpdate(compra.idProducto, {
                        $inc: { stock: -compra.cantidad, vendido: compra.cantidad }
                    });
                });

                Promise.all(updatesStock).then(() => {
                    // Guardar la factura
                    modelFactura.save((err, agregarFactura) => {
                        if (err) return res.status(500).send({ mensaje: "Error, no se puede guardar la factura" });
                        if (!agregarFactura) return res.status(500).send({ mensaje: "No se puede guardar la factura" });

                        // Vaciar el carrito
                        Carritos.findOneAndUpdate({ _id: carritoUsuario._id }, { compras: [], total: 0 }, { new: true }, (err, carritoVacio) => {
                            if (err) return res.status(500).send({ mensaje: "Error al vaciar el carrito" });

                            return res.status(200).send({ factura: agregarFactura });
                        });
                    });
                }).catch(err => {
                    return res.status(500).send({ mensaje: "Error al actualizar el stock de los productos" });
                });
            });
        });
    });
} */



    function CrearFacturaCliente(req, res) {
        const parametros = req.body;
    
        if (req.user.rol !== 'ROL_CLIENTE') {
            return res.status(500).send({ mensaje: "Únicamente el ROL_CLIENTE puede realizar esta acción" });
        }
    
        // Verificar que se reciban los datos de la tarjeta
        const { numeroTarjeta, nombreUsuario, mesExpiracion, yearExpiracion, codigoSeguridad } = parametros;
    
        if (!numeroTarjeta || !nombreUsuario || !mesExpiracion || !yearExpiracion || !codigoSeguridad) {
            return res.status(400).send({ mensaje: "Todos los campos de la tarjeta son requeridos." });
        }
    
        // Buscar el pedido del usuario
        Pedidos.findOne({ 'datosUsuario.idUsuario': req.user.sub, estadoPedido: 'sin confirmar' }, (err, pedidoEncontrado) => {
            if (err) return res.status(500).send({ mensaje: "Error en la petición" });
            if (!pedidoEncontrado) return res.status(500).send({ mensaje: "No hay pedidos sin confirmar para generar una factura" });
    
            if (!parametros.nit || parametros.nit === "") {
                return res.status(500).send({ mensaje: "Debe llenar el campo nit para generar la factura" });
            }
    
            let productosValidos = true; // Variable para controlar si todos los productos son válidos
            const updates = []; // Array para almacenar las promesas de actualización de stock
    
            // Verificar stock de los productos
            for (let i = 0; i < pedidoEncontrado.compras.length; i++) {
                const productoId = pedidoEncontrado.compras[i].idProducto;
                const cantidad = pedidoEncontrado.compras[i].cantidad;
    
                // Verificar el stock del producto
                const verificacion = Productos.findOne({ _id: productoId }).exec();
                updates.push(verificacion); // Guardamos la promesa
    
                verificacion.then(productoVerificacion => {
                    if (!productoVerificacion || cantidad > productoVerificacion.stock) {
                        productosValidos = false; // Hay un problema con el stock
                        res.status(500).send({
                            factura: "PROCESO DE FACTURACIÓN ANULADO",
                            advertencia: "Su pedido posee el producto " + pedidoEncontrado.compras[i].nombreProducto + " con una cantidad mayor al stock actual.",
                            mensaje: "Debe editar la cantidad de su pedido o eliminar el producto de su compra para generar una nueva factura."
                        });
                    }
                });
            }
    
            // Cuando todas las verificaciones de stock se completen
            Promise.all(updates).then(() => {
                if (!productosValidos) return; // Si hubo un problema, no continuamos
    
                // Verificar la tarjeta
                Tarjetas.findOne({ numeroTarjeta, nombreUsuario, mesExpiracion, yearExpiracion, codigoSeguridad }, (err, tarjetaEncontrada) => {
                    if (err) {
                        console.error("Error al verificar la tarjeta:", err);
                        return res.status(500).send({ mensaje: "Error al verificar la tarjeta" });
                    }
                    if (!tarjetaEncontrada) return res.status(400).send({ mensaje: "La tarjeta no es válida o no existe." });
    
                    // Verificar saldo de la tarjeta
                    if (parseFloat(tarjetaEncontrada.saldo) < pedidoEncontrado.total) {
                        return res.status(400).send({ mensaje: "Saldo insuficiente en la tarjeta." });
                    }
    
                    // Actualizar el saldo de la tarjeta
                    Tarjetas.findByIdAndUpdate(
                        tarjetaEncontrada._id,
                        { $inc: { saldo: -pedidoEncontrado.total } },
                        { new: true },
                        (err, tarjetaActualizada) => {
                            if (err) {
                                console.error("Error al actualizar el saldo de la tarjeta:", err);
                                return res.status(500).send({ mensaje: "Error al actualizar el saldo de la tarjeta" });
                            }
    
                            // Obtener el siguiente numeroDeOrden
                            Pedidos.find({}).sort({ numeroDeOrden: 1 }).exec((err, pedidos) => {
                                if (err) return res.status(500).send({ mensaje: "Error al obtener el número de orden" });
    
                                const nuevoNumeroDeOrden = pedidos.length > 0 ? (pedidos[pedidos.length - 1].numeroDeOrden + 1) : 1;
    
                                // Obtener datos del usuario
                                Usuarios.findById(req.user.sub, (err, usuario) => {
                                    if (err) return res.status(500).send({ mensaje: "Error al obtener datos del usuario" });
                                    if (!usuario) return res.status(500).send({ mensaje: "Usuario no encontrado" });
    
                                    // Crear una nueva factura
                                    const modelFactura = new Facturas();
                                    modelFactura.nit = parametros.nit;
                                    modelFactura.fecha = new Date();
                                    modelFactura.datosUsuario = [{
                                        idUsuario: usuario._id,
                                        nombre: usuario.nombre,
                                        apellido: usuario.apellido,
                                        email: usuario.email
                                    }];
    
                                    // Agregar datos de la tarjeta a la factura
                                    modelFactura.datosTarjeta = [{
                                        tipoTarjeta: tarjetaEncontrada.tipoTarjeta,
                                        nombreUsuario: tarjetaEncontrada.nombreUsuario
                                    }];
    
                                    // Agregar datos del pedido a la factura
                                    modelFactura.datosPedido = [{
                                        idPedido: pedidoEncontrado._id,
                                        fecha: pedidoEncontrado.fecha,
                                        tipoPago: pedidoEncontrado.tipoPago,
                                        direccionEnvio: pedidoEncontrado.direccionEnvio,
                                        horaEntrega: pedidoEncontrado.horaEntrega,
                                        metodoEnvio: pedidoEncontrado.metodoEnvio,
                                        descuentos: pedidoEncontrado.descuentos,
                                        numeroDeOrden: nuevoNumeroDeOrden, // Usar el nuevo número de orden
                                    }];
                                    modelFactura.compras = pedidoEncontrado.compras;
                                    modelFactura.total = pedidoEncontrado.total;
    
                                    // Actualizar el stock de los productos y generar la factura
                                    const updatesStock = pedidoEncontrado.compras.map(compra => {
                                        return Productos.findByIdAndUpdate(compra.idProducto, {
                                            $inc: { stock: -compra.cantidad, vendido: compra.cantidad }
                                        });
                                    });
    
                                    Promise.all(updatesStock).then(() => {
                                        // Guardar la factura
                                        modelFactura.save((err, agregarFactura) => {
                                            if (err) return res.status(500).send({ mensaje: "Error, no se puede guardar la factura" });
                                            if (!agregarFactura) return res.status(500).send({ mensaje: "No se puede guardar la factura" });
    
                                            // Cambiar el estado del pedido a "pagado"
                                            Pedidos.updateOne(
                                                { _id: pedidoEncontrado._id },
                                                {
                                                    estadoPedido: 'confirmado',
                                                    pagoConfirmado: 'pago confirmado',
                                                    numeroDeOrden: nuevoNumeroDeOrden // Actualizar el numeroDeOrden en el pedido
                                                },
                                                (err) => {
                                                    if (err) return res.status(500).send({ mensaje: "Error al actualizar el estado del pedido" });
    
                                                    return res.status(200).send({ factura: agregarFactura });
                                                }
                                            );
                                        });
                                    }).catch(err => {
                                        return res.status(500).send({ mensaje: "Error al actualizar el stock de los productos" });
                                    });
                                });
                            });
                        }
                    );
                });
            });
        });
    }

    


/* ROL FACTURADOR */
/* 1. PODER VER EL HISTORIAL DE CREDITO POR MEDIO DEL ID DE LA SUCURSAL */

/* puede verlo el facturador y el gestor maybe*/
function verFacturaCredito(req, res) {
    const idSucursal = req.params.idSucursal;
  
    // Buscar facturas que tengan datosSucursal con el idSucursal especificado
    Facturas.find({
        'datosSucursal.idSucursal': idSucursal,
        'datosPedido.tipoPago': 'Tarjeta de crédito'
    })
        .populate('compras.idProducto') // Asegúrate de usar populate si necesitas los datos de los productos
        .exec((err, facturasEncontradas) => {
            if (err) return res.send({ mensaje: "Error: " + err });

            if (!facturasEncontradas.length) {
                return res.send({ mensaje: "No se encontraron facturas." });
            }

            // Filtrar las facturas por tipo de pago "Tarjeta de crédito"
            const facturasCredito = facturasEncontradas.filter(factura =>
                factura.datosPedido.some(pedido => pedido.tipoPago === 'Tarjeta de crédito')
            );

            // Calcular el total de crédito
            const totalCredito = facturasCredito.reduce((total, factura) => {
                return total + factura.total; // Sumar el total de cada factura
            }, 0);

            // Crear la respuesta
            const response = {
                totalCredito: totalCredito,
                facturas: facturasCredito
            };

            return res.send(response);
        });
}



/* 2. agregar caja a sucursal */
function agregarCaja(req, res) {
    const { nombreSucursal, efectivoGeneral } = req.body;
    if (req.user.rol !== 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: "Únicamente el ROL_ADMIN puede realizar esta acción" });
    }

    // Verificamos que se envíen los datos necesarios
    if (!nombreSucursal || !efectivoGeneral) {
        return res.status(400).send({ mensaje: "Faltan datos requeridos" });
    }

    // Buscamos la sucursal por nombre
    Sucursales.findOne({ nombreSucursal }, (err, sucursalEncontrada) => {
        if (err) return res.status(500).send({ mensaje: "Error en la búsqueda de la sucursal: " + err });
        if (!sucursalEncontrada) return res.status(404).send({ mensaje: "Sucursal no encontrada" });

        // Comprobamos si ya existe una caja para esta sucursal
        Caja.findOne({ 'datosSucursal.idSucursal': sucursalEncontrada._id }, (err, cajaExistente) => {
            if (err) return res.status(500).send({ mensaje: "Error en la búsqueda de la caja: " + err });
            if (cajaExistente) return res.status(400).send({ mensaje: "Ya existe una caja para esta sucursal" });

            // Establecemos vueltosCliente a 0
            const vueltosCliente = 0;

            const totalPedidosCredito = 0;

            const totalPedidosEfectivo = 0;

            // Calculamos totalEfectivoFactura
            const totalEfectivoFactura = efectivoGeneral - vueltosCliente + totalPedidosCredito + totalPedidosEfectivo;

            // Creamos la nueva caja
            const nuevaCaja = new Caja({
                efectivoGeneral,
                vueltosCliente, // Establecer vueltosCliente a 0
                totalPedidosCredito,
                totalEfectivoFactura,
                totalPedidosEfectivo,

                datosSucursal: [{
                    idSucursal: sucursalEncontrada._id,
                    nombreSucursal: sucursalEncontrada.nombreSucursal,
                    direccionSucursal: sucursalEncontrada.direccionSucursal,
                    telefonoSucursal: sucursalEncontrada.telefonoSucursal,
                    departamento: sucursalEncontrada.departamento,
                    municipio: sucursalEncontrada.municipio,
                }]
            });

            // Guardamos la nueva caja en la base de datos
            nuevaCaja.save((err, cajaGuardada) => {
                if (err) return res.status(500).send({ mensaje: "Error al guardar la caja: " + err });

                return res.status(201).send({ caja: cajaGuardada });
            });
        });
    });
}


/* 3. ver caja por id sucu*/

function verCajaPorSucursal(req, res) {
    const { idSucursal } = req.params;

    // Validar que se envíe el idSucursal
    if (!idSucursal) {
        return res.status(400).send({ mensaje: "Falta el idSucursal" });
    }

    // Buscar la caja correspondiente a la sucursal
    Caja.findOne({ 'datosSucursal.idSucursal': idSucursal }, (err, cajaEncontrada) => {
        if (err) return res.status(500).send({ mensaje: "Error en la búsqueda de la caja: " + err });
        if (!cajaEncontrada) return res.status(404).send({ mensaje: "Caja no encontrada para esta sucursal" });

        // Devolver la caja encontrada
        return res.status(200).send({ caja: cajaEncontrada });
    });
}

/* 4. editar caja */
function editarCaja(req, res) {
    const { efectivoGeneral } = req.body; // Solo necesitamos el efectivoGeneral para la edición
    const { idCaja } = req.params; // Obtenemos el ID de la caja desde los parámetros

    // Validar que se envíe el efectivoGeneral
    if (!efectivoGeneral) {
        return res.status(400).send({ mensaje: "Falta el campo efectivoGeneral." });
    }

    // Buscar la caja por su ID
    Caja.findById(idCaja, (err, cajaEncontrada) => {
        if (err) return res.status(500).send({ mensaje: "Error en la búsqueda de la caja: " + err });
        if (!cajaEncontrada) return res.status(404).send({ mensaje: "Caja no encontrada" });

        // Actualizamos el efectivoGeneral
        cajaEncontrada.efectivoGeneral = efectivoGeneral; // Actualiza el efectivoGeneral

        // Guardar los cambios en la base de datos
        cajaEncontrada.save((err, cajaActualizada) => {
            if (err) return res.status(500).send({ mensaje: "Error al actualizar la caja: " + err });

            return res.status(200).send({ caja: cajaActualizada });
        });
    });
}

/* 5. eliminar caja */
function eliminarCaja(req, res) {


    var idCaja = req.params.idCaja;
    Caja.findByIdAndDelete(idCaja, (err, eliminarCaja) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if (!eliminarCaja) return res.status(500).send({ mensaje: "Error al eliminar la caja" });
        return res.status(200).send({ caja: eliminarCaja });
    })
}

/* 6. get caja por id */
function getCajaPorId(req, res) {

    // buscar por id
    var idCaja = req.params.idCaja;

    Caja.findById(idCaja, (err, cajaEncontrada) => {
        if (err) return res.status(500).send({ mensaje: "Error en la petición" });
        if (!cajaEncontrada) return res.status(500).send({ mensaje: "Error al ver la caja" });
        return res.status(200).send({ caja: cajaEncontrada })
    })
}


/* 7. que el cajero genere una factura */
/* 7. que el cajero genere una factura */
function generarFacturaPagoEfectivo(req, res) {
    const { nit, nombreSucursal, vueltosCliente } = req.body;

    // Verificar que los campos obligatorios estén presentes
    if (!nit || !nombreSucursal || vueltosCliente === undefined) {
        return res.status(400).send({ mensaje: "Los campos NIT, nombreSucursal y vueltosCliente son obligatorios." });
    }

    if (req.user.rol !== 'ROL_CAJERO') {
        return res.status(500).send({ mensaje: "Únicamente el ROL_CAJERO puede realizar esta acción" });
    }

    const idPedido = req.params.idPedido;

    // Buscar el pedido por ID
    Pedidos.findById(idPedido, (err, pedidoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: "Error en la petición" });
        if (!pedidoEncontrado) return res.status(404).send({ mensaje: "Pedido no encontrado" });

        // Verificar si el estadoOrden es "preparando su pedido"
        if (pedidoEncontrado.estadoOrden !== "preparando su pedido") {
            return res.status(400).send({ mensaje: "La factura solo puede generarse si el estado del pedido es 'preparando su pedido'." });
        }

        // Verificar si ya existe una factura para el pedido
        Facturas.findOne({ 'datosPedido.idPedido': pedidoEncontrado._id }, (err, facturaExistente) => {
            if (err) return res.status(500).send({ mensaje: "Error al verificar la factura" });
            if (facturaExistente) {
                return res.status(400).send({ mensaje: "Ya se ha generado una factura para este pedido." });
            }

            // Verificar que el tipo de pago sea "Efectivo"
            if (pedidoEncontrado.tipoPago !== "Efectivo") {
                return res.status(400).send({ mensaje: "La factura solo puede generarse si el tipo de pago es Efectivo." });
            }

            // Verificar que el NIT coincida con el del pago en efectivo
            const nitPedido = pedidoEncontrado.pagoEfectivo.length > 0 ? pedidoEncontrado.pagoEfectivo[0].nit : null;
            if (nit !== nitPedido) {
                return res.status(400).send({ mensaje: "El NIT proporcionado no coincide con el NIT del pago en efectivo del pedido." });
            }

            // Validar vueltosCliente
            const cambioCliente = pedidoEncontrado.pagoEfectivo.length > 0 ? pedidoEncontrado.pagoEfectivo[0].cambioCliente : null;
            if (Number(vueltosCliente) !== Number(cambioCliente)) {
                return res.status(400).send({ mensaje: `El vuelto debe ser ${cambioCliente}.` });
            }

            // Buscar la caja correspondiente a la sucursal
            Caja.findOne({ 'datosSucursal.nombreSucursal': nombreSucursal }, (err, cajaEncontrada) => {
                if (err) return res.status(500).send({ mensaje: "Error al buscar la caja" });
                if (!cajaEncontrada) return res.status(404).send({ mensaje: "Caja no encontrada para la sucursal proporcionada." });

                // Verificar que hay suficiente efectivo en la caja
                if (cajaEncontrada.efectivoGeneral < vueltosCliente) {
                    return res.status(400).send({ mensaje: "No hay suficiente efectivo en la caja para dar el vuelto." });
                }

                // Actualizar efectivoGeneral y totalEfectivoFactura
                cajaEncontrada.efectivoGeneral -= vueltosCliente; // Restar el vuelto del efectivo general
                cajaEncontrada.vueltosCliente = (cajaEncontrada.vueltosCliente || 0) + vueltosCliente; // Sumar el nuevo vuelto

                // Calcular el nuevo totalEfectivoFactura
                cajaEncontrada.totalEfectivoFactura = cajaEncontrada.efectivoGeneral + 
                    (cajaEncontrada.totalPedidosCredito || 0) + 
                    (cajaEncontrada.totalPedidosEfectivo || 0) - 
                    cajaEncontrada.vueltosCliente;

                // Agregar el pedido a historialPedidosEfectivo en Caja
                cajaEncontrada.historialPedidosEfectivo.push({
                    idPedido: pedidoEncontrado._id,
                    fecha: pedidoEncontrado.fecha,
                    tipoPago: pedidoEncontrado.tipoPago,
                    direccionEnvio: pedidoEncontrado.direccionEnvio,
                    horaEntrega: pedidoEncontrado.horaEntrega,
                    metodoEnvio: pedidoEncontrado.metodoEnvio,
                    descuentos: pedidoEncontrado.descuentos,
                    numeroDeOrden: pedidoEncontrado.numeroDeOrden,
                    estadoPedido: pedidoEncontrado.estadoPedido,
                    incrementoEnvio: pedidoEncontrado.incrementoEnvio,
                    estadoOrden: pedidoEncontrado.estadoOrden,
                    total: pedidoEncontrado.total,
                    pagoEfectivo: pedidoEncontrado.pagoEfectivo,
                    compras: pedidoEncontrado.compras // Agregando el array de compras
                });

                // Guardar los cambios en la caja
                cajaEncontrada.save(err => {
                    if (err) return res.status(500).send({ mensaje: "Error al actualizar la caja." });

                    // Crear una nueva factura
                    const modelFactura = new Facturas();
                    modelFactura.nit = nit;
                    modelFactura.fecha = new Date();
                    modelFactura.datosUsuario = [{
                        idUsuario: req.user.sub,
                        nombre: req.user.nombre,
                        apellido: req.user.apellido,
                        email: req.user.email
                    }];

                    // Agregar datos del pedido a la factura
                    modelFactura.datosPedido = [{
                        idPedido: pedidoEncontrado._id,
                        fecha: pedidoEncontrado.fecha,
                        tipoPago: pedidoEncontrado.tipoPago,
                        direccionEnvio: pedidoEncontrado.direccionEnvio,
                        horaEntrega: pedidoEncontrado.horaEntrega,
                        metodoEnvio: pedidoEncontrado.metodoEnvio,
                        descuentos: pedidoEncontrado.descuentos,
                        numeroDeOrden: pedidoEncontrado.numeroDeOrden,
                        pagoEfectivo: pedidoEncontrado.pagoEfectivo
                    }];
                    modelFactura.compras = pedidoEncontrado.compras; // Asignar las compras
                    modelFactura.total = pedidoEncontrado.total;

                    // Agregar datos del cajero a la factura
                    const datosCajero = {
                        idCajero: req.user.sub,
                        nombre: req.user.nombre,
                        apellido: req.user.apellido,
                        email: req.user.email,
                    };

                    modelFactura.datosCajero.push(datosCajero); // Ahora se agrega a la factura

                    // Actualizar el stock de los productos
                    const updatesStock = pedidoEncontrado.compras.map(compra => {
                        return Productos.findByIdAndUpdate(compra.idProducto, {
                            $inc: { stock: -compra.cantidad, vendido: compra.cantidad }
                        });
                    });

                    Promise.all(updatesStock).then(() => {
                        // Actualizar el campo pagoConfirmado y guardar el pedido
                        pedidoEncontrado.pagoConfirmado = "factura generada y confirmar";

                        // Guardar los cambios en el pedido
                        pedidoEncontrado.save(err => {
                            if (err) return res.status(500).send({ mensaje: "Error al actualizar el pedido." });

                            // Guardar la factura
                            modelFactura.save((err, agregarFactura) => {
                                if (err) return res.status(500).send({ mensaje: "Error, no se puede guardar la factura" });
                                return res.status(200).send({ factura: agregarFactura });
                            });
                        });
                    }).catch(err => {
                        return res.status(500).send({ mensaje: "Error al actualizar el stock de los productos" });
                    });
                });
            });
        });
    });
}


function ObtenerTodasCajas(req, res) {



    Caja.find((err, cajaEncontrada) => {
        if (err) return res.send({ mensaje: "Error: " + err })

        return res.send({ caja: cajaEncontrada })
        /* Esto retornara
            {
                productos: ["array con todos los productos"]
            }
        */
    })
}

function obtenerFacturasPorIdSucursal(req, res) {
   

    const idSucursal = req.params.idSucursal; // ID de la sucursal desde la ruta

    // Validar que se reciba el ID de la sucursal
    if (!idSucursal) {
        return res.status(400).send({ mensaje: 'Falta el ID de la sucursal.' });
    }

    // Buscar las facturas donde al menos una de las compras tiene el idSucursal proporcionado
    // y donde el tipoPago en datosPedido es "Efectivo"
    Facturas.find({
        'compras.datosSucursal.idSucursal': idSucursal,
        'datosPedido.tipoPago': 'Efectivo'
    }, (err, facturasEncontradas) => {
        if (err) return res.status(500).send({ mensaje: 'Error al buscar las facturas.' });
        if (!facturasEncontradas || facturasEncontradas.length === 0) {
            return res.status(404).send({ mensaje: 'No se encontraron facturas para la sucursal proporcionada.' });
        }

        return res.status(200).send({ facturas: facturasEncontradas });
    });
}


/* ver caja por usuario */

function verCajaPorUsuario(req, res) {
    

    // Buscar las sucursales a las que el usuario tiene acceso
    Sucursales.find({ gestorSucursales: { $elemMatch: { idUsuario: req.user.sub } } }, (err, sucursalesEncontradas) => {
        if (err) return res.status(500).send({ mensaje: "Error en la búsqueda de sucursales." });
        if (!sucursalesEncontradas || sucursalesEncontradas.length === 0) {
            return res.status(404).send({ mensaje: "No se encontraron sucursales para este usuario." });
        }

        // Obtener los IDs de las sucursales encontradas
        const idsSucursales = sucursalesEncontradas.map(sucursal => sucursal._id);

        // Buscar las cajas correspondientes a las sucursales encontradas
        Caja.find({ 'datosSucursal.idSucursal': { $in: idsSucursales } }, (err, cajasEncontradas) => {
            if (err) return res.status(500).send({ mensaje: "Error en la búsqueda de cajas: " + err });
            if (!cajasEncontradas || cajasEncontradas.length === 0) {
                return res.status(404).send({ mensaje: "No se encontraron cajas para las sucursales." });
            }

            // Devolver las cajas encontradas
            return res.status(200).send({ cajas: cajasEncontradas });
        });
    });
}



module.exports = {
    GenerarFactura,
    CrearFacturaCliente,
    verFacturaPorPedido,
    verFacturaCredito,
    agregarCaja,
    verCajaPorSucursal,
    editarCaja,
    eliminarCaja,
    getCajaPorId,
    generarFacturaPagoEfectivo,
    ObtenerTodasCajas,
    obtenerFacturasPorIdSucursal,
    verCajaPorUsuario
}





