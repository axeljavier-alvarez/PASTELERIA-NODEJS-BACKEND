

const Facturas = require('../models/facturas.model');
const Carritos = require('../models/carritos.model');
const Productos = require('../models/productos.model');
const Usuarios = require('../models/usuarios.model');
const Pedidos = require('../models/pedidos.model');
const Tarjetas = require('../models/tarjetas.model');

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

function GenerarFactura(req,res){
    var parametros = req.body;
    if (req.user.rol !== 'ROL_CLIENTE') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_CLIENTE puede realizar esta acción " });
    }

    Carritos.findOne({idUsuario:req.user.sub},(err, carritoUsuario)=>{
        if(err) return res.status(500).send({ mensaje:"Error en la peticion"})
        if(!carritoUsuario) return res.status(500).send({ mensaje:"El usuario no posee carritos, no puede acceder a crear facturas, debe crear un carrito"})
        if(carritoUsuario.compras.length==0) return res.status(500).send({mensaje:"No existen productos en el carrito del usuario "})

        
        if(!parametros.nit||parametros.nit==""){
            return res.status(500).send({ mensaje:"Debe llenar el campo nit para generar la factura"})
        }else{


            for (let i = 0; i <carritoUsuario.compras.length;i++){
                //console.log("ENtra a ford ")
                Productos.findOne({_id:carritoUsuario.compras[i].idProducto},(err,productoVerificacion)=>{
                    if(err) return res.status(500).send({ mensaje:"Error en la peticion"})
                    if(!carritoUsuario) return res.status(500).send({ mensaje:"Busqeuda de producto inexistente"})

                    if(carritoUsuario.compras[i].cantidad>productoVerificacion.stock){
                        //console.log("PROCESO ANULADO ")


                        return res.status(500).send({ factura:"PROCESO DE FACTURACIÓN ANULADO",advertencia:"Su carrito posee el producto "+
                        carritoUsuario.compras[i].nombreProducto+" con una cantidad mayor al stock actual. ",
                        mensaje:"Debe editar la cantidad de su carrito o eliminar el producto de su compra para generar una nueva factura."})
                    }else{
                        

                        if ( carritoUsuario.idUsuario == req.user.sub){
                           
                            var restarStock = (carritoUsuario.compras[i].cantidad * -1)
                            ////console.log(restarStock)
                            var cantidadVendido = carritoUsuario.compras[i].cantidad
                                    Productos.findByIdAndUpdate(carritoUsuario.compras[i].idProducto, { $inc : { stock: restarStock,vendido:cantidadVendido } }, { new: true },
                                        (err, productoModificado) => {
                                            if(!productoModificado) return res.status(500).send({ mensaje: 'Error al editar editar productos'});
                                            if(err) return res.status(500).send({ mensaje:"Error en la peticion"})


                                    })
                                    

                        }else{
                            return res.status(200).send({mensaje:"Verifique los datos de su carrito",})
                        }
                    }

                })

            }

            const modelFactura = new Facturas()
            modelFactura.nit = parametros.nit
            modelFactura.fecha =  (new Date())
            modelFactura.compras = carritoUsuario.compras
            modelFactura.total =carritoUsuario.total
            modelFactura.idUsuario = req.user.sub
            let limpiarCarrito = []
            Carritos.findOneAndUpdate({_id:carritoUsuario._id},  { compras: limpiarCarrito , total: 0 }, { new: true }, 
                (err, carritoVacio)=>{

                modelFactura.save((err,agregarFactura)=>{  
                                       
                    if(err) return res.status(500).send({ mensaje:"Erro, no se puede guardar el carrito"})
                    if(!agregarFactura) return res.status(500).send({ mensaje:"No se puede guardar el carrito"})
                 

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
                            Pedidos.find({}, 'numeroDeOrden').sort({ numeroDeOrden: -1 }).limit(1).exec((err, pedidos) => {
                                if (err) return res.status(500).send({ mensaje: "Error al obtener el número de orden" });
                                
                                const nuevoNumeroDeOrden = (pedidos.length > 0 ? pedidos[0].numeroDeOrden : 0) + 1;
    
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


module.exports={
    GenerarFactura,
    CrearFacturaCliente,
    verFacturaPorPedido
}





