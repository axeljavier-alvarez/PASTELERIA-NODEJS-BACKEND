const Carritos = require('../models/carritos.model');

const Productos = require('../models/productos.model');

const Usuarios = require('../models/usuarios.model');


function RegistrarCarrito(req, res) {
    if (req.user.rol !== 'ROL_CLIENTE') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_CLIENTE puede realizar esta acción " });
    }
     //OBTENCION DE PARAMETROS
     var parametros = req.body;
     
     //VERIFICA SI EXISTE EL CARRITO DE MI USUARIO
     Carritos.findOne({idUsuario:req.user.sub},(err, carritoUsuario)=>{
     if(err) return res.status(500).send({ mensaje: 'Error al agregar carrito  '});
         if(carritoUsuario==null) {//CREAR CARRITO PARA USUARIO
 
             var carritoModel = new Carritos();
             carritoModel.idUsuario = req.user.sub;
             carritoModel.total = 0
             //GUARDA UN CARRITO PARA USUARIO
             carritoModel.save((err, carrritoUsuario) => {
                 if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                 if(!carrritoUsuario) return res.status(500).send({ mensaje: 'Error al agregar la carrito'});
                 //VERIFICA PARAMETROS OBLIGATORIOS
                 if(parametros.nombreProducto && parametros.cantidad
                 &&parametros.descripcion!=""&&parametros.nombreCategoria!="") {
                     //VERIFICA SI EL PRODUCTO EXISTE
                         Productos.findOne({ nombreProducto : parametros.nombreProducto}, (err, productoEncontrado) => {
                             if(err) return res.status(500).send({ mensaje: 'Error en la peticion, no existe el producto'});
                             if(!productoEncontrado) return res.status(500).send ({ mensaje: 'Este producto no existe. Verifique el nombre'})
                             //SI EL PRODUCTO EXISTE
                             if ( productoEncontrado.length != 0 ) {//PRODUCTO EXISTE
                                 //BUSCO EN CARRITO EL ID_USUARIO
                                 Carritos.findOne({idUsuario:req.user.sub}, (err, productoCarrito) => {
                                     //console.log(productoCarrito.compras.length===0)
                                         //VERIFICA SI EL ARRAY DE PRODUCTO ESTA VACIO
                                         if ( productoCarrito.compras.length===0) {//EL PRODUCTO NO SE ENCUNTRA EN EL CARRITO
                                             //VERIFICA SI LA CANTIDAD ES 0
                                             if(parametros.cantidad<=0) return res.status(500).send({ mensaje: 'La cantidad no puede ser menor o igual a cero'});
                                             //VERIFICA QUE LA CANTIDAD MENOR O IGUAL QUE ESTOCK
                                             if(parametros.cantidad>productoEncontrado.stock){//VERIFICAR STOCK
                                                 //PRODUCTO AGOTADO
                                                 if(productoEncontrado.stock==0) return res.status(500).send({ mensaje: 'Producto agotado. No es posible agregar el producto.'})
     
                                                 return res.status(500).send({ mensaje: 'Por ahora no puede comprar más artículos. La cantidad del producto en su carrito es mayor al stock.'});
                                             }
                                             //MULTIPLICACION DEL SUBTOTAL
                                             var subtotalAgregar = 0
                                             var subtotalAgregar = (parametros.cantidad*productoEncontrado.precio)
                                             //MODIFICA EL ARRAY Y AGAREGA PRODUCTO
                                             Carritos.findByIdAndUpdate({_id:carrritoUsuario._id},{ total: (productoCarrito.total+ subtotalAgregar),

                                                 $push: {
                                                     compras: [{
                                                         
                                                         idProducto:productoEncontrado._id,nombreProducto: productoEncontrado.nombreProducto,
                                                         cantidad: parametros.cantidad, precio: productoEncontrado.precio,subTotal: (parametros.cantidad*productoEncontrado.precio) 
                                                     
 
                                                     }]
                                                 } 
                                             }, { new: true},  
                                                 (err, carritoActualizado)=>{  
                                                     if(err) return res.status(500).send({ mensaje: "Error en la peticion de modificar carrito"});
                                                     if(!carritoActualizado) return res.status(500).send({ mensaje: 'Error al modificar el carrito'});
                             
                                                     return res.status(200).send({ mensaje:"SE HA CREADO EL CARRITO",carrito: carritoActualizado })
                                             }).populate('idUsuario','nombre apellido email');                                    
                 
                                         }else{
                                             return res.status(200).send({ mensaje: "Falla en registar carrito"})
                                         }
                                 })
                             } else {
                                 return res.status(500)
                                     .send({ mensaje: 'Este producto no existe. Ingrese otro nombre.' });
                             }
                         })                               
                 }else{
                     return res.status(500)
                     .send({ mensaje: 'Debe llenar los campos necesarios (nombreProducto, cantidad)'});
                 }
 
             }); 
 
         }else{//ESTE USUARIO POSEE UN CARRITO
             //VERIFICA PARAMETROS OBLIGATORIOS
             if(parametros.nombreProducto && parametros.cantidad&&parametros.descripcion!=""&&parametros.nombreCategoria!="") {
                     //BUSCA EXISTENCIA DE PRODUCTO
                     Productos.findOne({ nombreProducto : parametros.nombreProducto}, (err, productoEncontrado) => {
                         if(err) return res.status(500).send({ mensaje: 'Error en la peticion, no existe el producto'});
                         if(!productoEncontrado) return res.status(500).send ({ mensaje: 'Este producto no existe. Verifique el nombre'})
                         //VERIFICA SI EL PRODUCTO EXISTE
                         if ( productoEncontrado != 0 ) {//PRODUCTO EXISTE
                             
                             Carritos.findOne({idUsuario:carritoUsuario.idUsuario}, (err, productoCarrito) => {
                                 //if(err) //console.log(err)
                                 //if(!productoCarrito) //console.log(productoCarrito)
 
                                 //VERIFICACION SI PRODUCTO ESTA EN CARRITO
                                 if ( productoCarrito.compras ===0||productoCarrito.compras.length==0) {//NO HAY PRODUCTOS EN EL CARRITO
                                     //VERIFICAR QUE LA CANTIDAD 
                                     if(parametros.cantidad<=0) return res.status(500).send({ mensaje: 'La cantidad no puede ser menor o igual a cero'});
                                     if(parametros.cantidad>productoEncontrado.stock){//VERIFICAR STOCK
 
                                         if(productoEncontrado.stock==0) return res.status(500).send({ mensaje: 'Producto agotado. No es posible agregar el producto.'})
 
                                         return res.status(500).send({ mensaje: 'Por ahora no puede comprar más artículos. La cantidad del producto en su carrito es mayor al stock.'});
                                     }
                                     var subtotalAgregar = 0
                                      subtotalAgregar = (parametros.cantidad*productoEncontrado.precio)
                                     //EDICION CARRITO DEL CARRITO
                                     //console.log("Ejecucion de no hay productos en carrito")
                                     Carritos.findByIdAndUpdate({_id:productoCarrito._id},{ total: (productoCarrito.total+ subtotalAgregar), 
                                         $push: {
                                             compras: [{
                                                 
                                                 idProducto:productoEncontrado._id,nombreProducto: productoEncontrado.nombreProducto,
                                                 cantidad: parametros.cantidad, precio: productoEncontrado.precio,subTotal: (parametros.cantidad*productoEncontrado.precio) 
 
                                             }]
                                         } 
                                     }, { new: true},  
                                         (err, carritoActualizado)=>{  
                                             if(err) return res.status(500).send({ mensaje: "Error en la peticion de modificar carrito"});
                                             if(!carritoActualizado) return res.status(500).send({ mensaje: 'Error al modificar el carrito'});
                     
                                             return res.status(200).send({mensaje:"REGISTRO EXITOSO", carrito: carritoActualizado })
                                     }).populate('idUsuario','nombre apellido email');                                    
         
                                 
                                 }else{//HAY OTROS PRODUCTOS EN EL CARRITO
                                     //console.log("Ejecucion de hay mas productos en carrito")
                                     // RECORRE EL ARRay - ENCONTRAR COINCIDENCIAS
                                     var recorridoFord = 0
                                     var encontrado = false
 
                                     for (let i = 0; i <productoCarrito.compras.length;i++){
                                         //VERIFICA SI EL PRODUCTO EXISTE
                                         //SI EL PRODUCTO YA ESTA EN UN OBJETO - CAMBIAR CANTIDAD Y TOTALES
 
                                         if ( productoCarrito.compras[i].nombreProducto == parametros.nombreProducto){
                                             //console.log("El producto es ya se encuntra en el carrito")
                                                 var idProducto =productoCarrito.compras[i].idProducto
                                                 var cantidadAnterior = productoCarrito.compras[i].cantidad
 
                                                 var cantidadNueva = 0
                                                 
                                                 cantidadNueva =( (parseInt(cantidadAnterior))+(parseInt(parametros.cantidad)))                                               
                                                 
                                                 //CANTIDAD INGRESADA NO PUEDE SER 0 
                                                 if(parametros.cantidad==0) return res.status(500).send({ mensaje: 'La cantidad ingresada no puede ser igual a 0. Ingrese otra cantidad.',stock:'Stock actual del producto '+productoEncontrado.stock});
                                                 if(cantidadNueva< 0 ) return res.status(500).send({ mensaje: 'La nueva cantidad a comprar no es válida según el stock del producto. Verifique su compra.',stock:'Stock actual del producto '+productoEncontrado.stock});
                                                 if(cantidadNueva==0 ) return res.status(500).send({ mensaje: 'La nueva cantidad a comprar es 0. Por lo que se le aconseja eliminar el producto del carrito, si ya no desea comprar',stock:'Stock actual del producto '+productoEncontrado.stock});
 
 
                                                 if(cantidadNueva>productoEncontrado.stock){//VERIFICAR STOCK
         
                                                     if(productoEncontrado.stock==0) return res.status(500).send({ mensaje: 'Producto agotado. No es posible agregar el producto.'})
         
                                                     return res.status(500).send({ mensaje: 'Por ahora no puede comprar más artículos. La cantidad del producto en su carrito es mayor al stock. '})
                                                 }
 
                                                 //console.log("MODICA CANTIDAD CARRITO")
 
                                                 var subtotalAgregarNuevo = 0
                                                 var subtotalAgregarNuevo = (parametros.cantidad*productoEncontrado.precio)
                                                 //console.log("Cantidad anterior "+cantidadAnterior)
                                                 //console.log("Cantidad ingresada "+parametros.cantidad)
                                                 //console.log("Cantidad resultante "+cantidadNueva)
                                                 //console.log("sub "+subtotalAgregarNuevo)
                                                 //console.log(productoCarrito.total)
 
                                                 Carritos.findOneAndUpdate( {  idUsuario:req.user.sub , "compras.idProducto":productoEncontrado._id },
                                                 {total: ( productoCarrito.total + subtotalAgregarNuevo),
                                                     "$set":{
                                                         "compras.$.cantidad": cantidadNueva,
                                                         "compras.$.subTotal": (cantidadNueva*productoEncontrado.precio),
 
                                                     }
                                                 },{ new: true},             
                                                     (err, carritoAgregadoProductoExistente) => {
 
                                                         if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
                                                         if(!carritoAgregadoProductoExistente) return res.status(500).send({ mensaje: 'Error al editar la cantidad del Producto'});                                            
 
 
                                                         Carritos.findOne({idUsuario:req.user.sub},(err,carritoFinal)=>{
                                                             if(err) return res.status(500).send({ mensaje: "Error en la peticion, es necesario que el Administrador revise la base de datos" });
                                                             if(!carritoFinal) return res.status(500).send({ mensaje: 'Error al editar la cantidad del carrito'});
                                                             return res.status(200).send({mensaje:'PRODUCTO DE CARRITO MODIFICADO',carrito:carritoAgregadoProductoExistente});
                                                         })
 
                                                     }).populate('idUsuario','nombre apellido email');  
                                                     encontrado = true
                                         }  
                                     }
 
                                     if(encontrado==false){
                                     //SI LUEGO DE EJECUTAR EL FOR NO ENUCNTRA COINCIDENCIAS DE PRODUCTO -> EL PRODUCTO ES NUEVO
                                         //PROUCTO NUEVO A CARRITO
                                         //console.log("El producto no se encuntra")
                                         nuevoProducto = true
                                         //console.log("El producto es nuevo y se agrega")
                                         if(parametros.cantidad<=0) return res.status(500).send({ mensaje: 'La cantidad no puede ser menor o igual a cero'});
                                         if(parametros.cantidad>productoEncontrado.stock){//VERIFICAR STOCK
     
                                             if(productoEncontrado.stock==0) return res.status(500).send({ mensaje: 'Producto agotado. No es posible agregar el producto.'})
     
                                             return res.status(500).send({ mensaje: 'Por ahora no puede comprar más artículos. La cantidad del producto en su carrito es mayor al stock. '});
                                         }
                                         var subtotalAgregarProd = 0
                                         subtotalAgregarProd = (parametros.cantidad*productoEncontrado.precio)
                                         //console.log(productoCarrito.total)
                                         //console.log(subtotalAgregarProd)
 
                                         Carritos.findByIdAndUpdate({_id:productoCarrito._id},{ total: (productoCarrito.total + subtotalAgregarProd), 
                                             $push: {
                                                 compras: [{
                                                     
                                                     idProducto:productoEncontrado._id,nombreProducto: productoEncontrado.nombreProducto,
                                                     cantidad: parametros.cantidad, precio: productoEncontrado.precio,subTotal: (parametros.cantidad*productoEncontrado.precio) 
     
                                                 }]
                                             } 
                                         }, { new: true},  
                                             (err, carritoActualizado)=>{  
                                                 if(err) return res.status(500).send({ mensaje: "Error en la peticion de modificar carrito"});
                                                 if(!carritoActualizado) return res.status(500).send({ mensaje: 'Error al modificar el carrito'});
                         
                                                 return res.status(200).send({mensaje:"NUEVO PRODUCTOS REGISTRADO EN CARRITO", carrito: carritoActualizado })
                                         }).populate('idUsuario','nombre');      
                                     }
 
                                 }
 
                             })
 
                         } else {
                             return res.status(500)
                                 .send({ mensaje: 'Este producto no existe. Ingrese otro nombre.' });
                         }
                     })                               
             }else{
                 return res.status(500)
                 .send({ mensaje: 'Debe llenar los campos necesarios (nombreProducto, cantidad) -'});
             }
         }
     })
}


function EliminarProductoCarrito(req, res) {
    var idProd = req.params.idProducto

    if ( req.user.rol == "ROL_ADMINISTRADOR" ) return res.status(500)
    .send({ mensaje: 'No tiene acceso a registar Carritos. Únicamente el Cliente puede hacerlo.'});

    Carritos.findOne({idUsuario:req.user.sub},(err, carritoUsuario)=>{
        if(err) return res.status(500).send({ mensaje:"Error en la peticion, el usuario no posee carritos"})
        if(!carritoUsuario) return res.status(500).send({ mensaje:"El usuario no posee carritos, no puede acceder a esta función"})
            
            var finalFord = 0                                    
       
                for (let i = 0; i <carritoUsuario.compras.length;i++){
                        if ( carritoUsuario.compras[i].idProducto == idProd){
                           
                            var idELiminar = carritoUsuario.compras[i]._id
                         

                            var totalModificado = 0
                            var totalModificado = ((carritoUsuario.total)-(carritoUsuario.compras[i].subTotal))
                            Carritos.findOneAndUpdate({_idUsuario:req.user.sub},{total:totalModificado,
                                $pull: {
                                    compras: {_id:idELiminar}
                                }
                            }, { new: true},  
                                (err, carritoActualizado)=>{  
                              
                                    if(err) return res.status(500).send({ mensaje: "Error en la peticion de modificar carrito"});
                                    if(!carritoActualizado) return res.status(500).send({ mensaje: 'Error al modificar el carrito'});
            
                                    return res.status(200).send({mensaje:"PRODUCTO ELIMINADO DEL CARRITO", carrito: carritoActualizado })
                            }).populate('idUsuario','nombre');
                        }else{
                            finalFord++ 
                            if(finalFord == carritoUsuario.compras.length){
                                return res.status(200).send({mensaje:'El producto no existe en el carrito'})
                            }
                        }
                    
                }

        })


}


function agregarCarritoPorIdProducto(req, res) {
    if (req.user.rol !== 'ROL_CLIENTE') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_CLIENTE puede realizar esta acción " });
    }

    // Obtención de parámetros
    var parametros = req.body;
    var idProd = req.params.ID;

    // Verifica si existe el carrito del usuario
    Carritos.findOne({ idUsuario: req.user.sub }, (err, carritoUsuario) => {
        if (err) return res.status(500).send({ mensaje: 'Error al agregar carrito' });

        // Verifica la existencia del producto
        Productos.findById(idProd, (err, productoEncontrado) => {
            if (err || !productoEncontrado) return res.status(500).send({ mensaje: 'Error al buscar producto' });

            // Verifica la cantidad
            const cantidad = Number(parametros.cantidad);
            if (cantidad <= 0) return res.status(500).send({ mensaje: 'La cantidad no puede ser menor o igual a cero' });
            if (cantidad > productoEncontrado.stock) return res.status(500).send({ mensaje: 'Cantidad excede el stock disponible' });

            // Crea el objeto de compra con datos adicionales
            const compra = {
                idProducto: productoEncontrado._id,
                nombreProducto: productoEncontrado.nombreProducto,
                marca: productoEncontrado.marca,
                imagen: productoEncontrado.imagen,
                cantidad: cantidad,
                size: productoEncontrado.size,
                precio: productoEncontrado.precio,
                subTotal: cantidad * productoEncontrado.precio,
                descripcionCategoria: productoEncontrado.descripcionCategoria,
                datosSucursal: productoEncontrado.datosSucursal
            };

            // Si no existe el carrito, crea uno nuevo
            if (!carritoUsuario) {
                var carritoModel = new Carritos();
                carritoModel.idUsuario = req.user.sub;
                carritoModel.total = 0;

                // Guarda un carrito para el usuario
                carritoModel.save((err, carritoUsuario) => {
                    if (err) return res.status(500).send({ mensaje: 'Error en la petición' });
                    if (!carritoUsuario) return res.status(500).send({ mensaje: 'Error al agregar el carrito' });

                    // Agrega el producto al nuevo carrito
                    Carritos.findByIdAndUpdate(
                        { _id: carritoUsuario._id },
                        {
                            total: (carritoUsuario.total + compra.subTotal),
                            $push: { compras: compra }
                        },
                        { new: true },
                        (err, carritoActualizado) => {
                            if (err) return res.status(500).send({ mensaje: "Error al modificar carrito" });
                            return res.status(200).send({ mensaje: "Carrito creado y producto agregado", carrito: carritoActualizado });
                        }
                    );
                });
            } else {
                // Verifica si el producto ya está en el carrito
                const productoEnCarrito = carritoUsuario.compras.find(item => item.idProducto.toString() === idProd);
                
                // Obtiene el nombre de la sucursal del primer producto en el carrito, si existe
                const nombreSucursalCarrito = carritoUsuario.compras.length > 0 ? carritoUsuario.compras[0].datosSucursal[0].nombreSucursal : null;

                // Si no hay productos en el carrito, se puede agregar el nuevo producto sin problemas
                if (!productoEnCarrito) {
                    // Verifica si el nombre de la sucursal es diferente
                    if (nombreSucursalCarrito && nombreSucursalCarrito !== productoEncontrado.datosSucursal[0].nombreSucursal) {
                        return res.status(400).send({ mensaje: 'Todos los productos deben pertenecer a la misma sucursal.' });
                    }

                    // Agrega un nuevo producto al carrito
                    Carritos.findByIdAndUpdate(
                        carritoUsuario._id,
                        {
                            $push: { compras: compra },
                            $inc: { total: compra.subTotal }
                        },
                        { new: true },
                        (err, carritoActualizado) => {
                            if (err) return res.status(500).send({ mensaje: "Error al agregar producto al carrito" });
                            return res.status(200).send({ mensaje: "Producto agregado al carrito", carrito: carritoActualizado });
                        }
                    );
                } else {
                    // Actualiza la cantidad del producto existente
                    var cantidadNueva = productoEnCarrito.cantidad + cantidad;

                    // Verifica si el nombre de la sucursal es diferente
                    if (nombreSucursalCarrito && nombreSucursalCarrito !== productoEncontrado.datosSucursal[0].nombreSucursal) {
                        return res.status(400).send({ mensaje: 'Todos los productos deben pertenecer a la misma sucursal.' });
                    }

                    if (cantidadNueva > productoEncontrado.stock) {
                        return res.status(500).send({ mensaje: 'La cantidad total excede el stock disponible' });
                    }

                    Carritos.findOneAndUpdate(
                        { idUsuario: req.user.sub, "compras.idProducto": idProd },
                        {
                            $set: {
                                "compras.$.cantidad": cantidadNueva,
                                "compras.$.subTotal": cantidadNueva * productoEncontrado.precio,
                                "compras.$.size": productoEncontrado.size,
                                "compras.$.datosSucursal": productoEncontrado.datosSucursal
                            },
                            $inc: { total: cantidad * productoEncontrado.precio }
                        },
                        { new: true },
                        (err, carritoActualizado) => {
                            if (err) return res.status(500).send({ mensaje: "Error al actualizar el carrito" });
                            return res.status(200).send({ mensaje: "Producto actualizado en el carrito", carrito: carritoActualizado });
                        }
                    );
                }
            }
        });
    });
}




/* function verCarritosClienteRegistrado(req, res) {

    if (req.user.rol !== 'ROL_CLIENTE') {
        return res.status(500).send({ mensaje: "Únicamente el ROL_CLIENTE puede realizar esta acción." });
    }

    Carritos.find({ datosUsuario: { $elemMatch: { idUsuario: req.user.sub } } }, (err, carritosEncontrados) => {
        if (err) return res.status(500).send({ mensaje: "Error en la petición." });
        if (!carritosEncontrados || carritosEncontrados.length === 0) {
            return res.status(404).send({ mensaje: "No se encontraron carritos para este cliente" });
        }
        return res.status(200).send({ carritos: carritosEncontrados });
    });
} */


    function verCarritosClienteRegistrado(req, res) {
        // Verifica si el usuario está autenticado
        if (req.user.rol !== 'ROL_CLIENTE') {
            return res.status(500).send({ mensaje: "Únicamente el ROL_CLIENTE puede realizar esta acción." });
        }
    
        // Busca los carritos del usuario usando el idUsuario directamente
        Carritos.find({ idUsuario: req.user.sub }, (err, carritosEncontrados) => {
            if (err) return res.status(500).send({ mensaje: "Error en la petición." });
            if (!carritosEncontrados || carritosEncontrados.length === 0) {
                return res.status(404).send({ mensaje: "No se encontraron carritos para este cliente" });
            }
            return res.status(200).send({ carritos: carritosEncontrados });
        });
    }
    

    /* actualizar carrito */

    function actualizarStockProducto(req, res) {
        const { idProducto, cantidad } = req.body; // Obtener los campos del cuerpo de la petición
        const nuevaCantidad = Number(cantidad); // Nueva cantidad desde el cuerpo de la petición
    
        // Validar campos obligatorios
        if (!idProducto || !cantidad) {
            return res.status(400).send({ mensaje: 'Faltan campos obligatorios: idProducto y cantidad.' });
        }
    
        if (nuevaCantidad <= 0) {
            return res.status(400).send({ mensaje: 'La cantidad debe ser mayor que cero.' });
        }
    
        // Verifica si existe el carrito del usuario
        Carritos.findOne({ idUsuario: req.user.sub }, (err, carritoUsuario) => {
            if (err) return res.status(500).send({ mensaje: 'Error al buscar el carrito' });
    
            if (!carritoUsuario) {
                return res.status(404).send({ mensaje: 'No se encontró el carrito del usuario.' });
            }
    
            // Verifica si el producto está en el carrito
            const productoEnCarrito = carritoUsuario.compras.find(item => item.idProducto.toString() === idProducto);
            if (!productoEnCarrito) {
                return res.status(404).send({ mensaje: 'El producto no está en el carrito.' });
            }
    
            // Busca el producto para verificar el stock
            Productos.findById(idProducto, (err, productoEncontrado) => {
                if (err || !productoEncontrado) {
                    return res.status(500).send({ mensaje: 'Error al buscar el producto' });
                }
    
                // Validar que la nueva cantidad no exceda el stock
                if (nuevaCantidad > productoEncontrado.stock) {
                    return res.status(400).send({ mensaje: 'La cantidad solicitada excede el stock disponible.' });
                }
    
                // Actualiza la cantidad y el subtotal del producto en el carrito
                const subTotal = nuevaCantidad * productoEncontrado.precio;
    
                Carritos.findOneAndUpdate(
                    { idUsuario: req.user.sub, "compras.idProducto": idProducto },
                    {
                        $set: {
                            "compras.$.cantidad": nuevaCantidad,
                            "compras.$.subTotal": subTotal
                        },
                        $inc: { total: subTotal - productoEnCarrito.subTotal } // Ajusta el total del carrito
                    },
                    { new: true },
                    (err, carritoActualizado) => {
                        if (err) return res.status(500).send({ mensaje: "Error al actualizar el carrito" });
                        return res.status(200).send({ mensaje: "Cantidad actualizada en el carrito", carrito: carritoActualizado });
                    }
                );
            });
        });
    }
    
    

    function eliminarProductoDelCarrito(req, res) {
        
    
        const idProd = req.params.ID; // ID del producto a eliminar
    
        // Verifica si existe el carrito del usuario
        Carritos.findOne({ idUsuario: req.user.sub }, (err, carritoUsuario) => {
            if (err) return res.status(500).send({ mensaje: 'Error al buscar el carrito' });
    
            if (!carritoUsuario) {
                return res.status(404).send({ mensaje: 'No se encontró el carrito del usuario.' });
            }
    
            // Verifica si el producto está en el carrito
            const productoEnCarrito = carritoUsuario.compras.find(item => item.idProducto.toString() === idProd);
            if (!productoEnCarrito) {
                return res.status(404).send({ mensaje: 'El producto no está en el carrito.' });
            }
    
            // Calcula el nuevo total restando el subtotal del producto a eliminar
            const nuevoTotal = carritoUsuario.total - productoEnCarrito.subTotal;
    
            // Elimina el producto del carrito
            Carritos.findOneAndUpdate(
                { idUsuario: req.user.sub },
                {
                    $pull: { compras: { idProducto: idProd } }, // Elimina el producto del array de compras
                    total: nuevoTotal // Actualiza el total del carrito
                },
                { new: true },
                (err, carritoActualizado) => {
                    if (err) return res.status(500).send({ mensaje: "Error al eliminar el producto del carrito" });
                    return res.status(200).send({ mensaje: "Producto eliminado del carrito", carrito: carritoActualizado });
                }
            );
        });
    }



    function verProductoCarritoPorId(req, res) {
        if (req.user.rol !== 'ROL_CLIENTE') {
            return res.status(500).send({ mensaje: "Únicamente el ROL_CLIENTE puede realizar esta acción" });
        }
    
        const idProd = req.params.idProducto; // ID del producto a visualizar
    
        // Busca el carrito del usuario
        Carritos.findOne({ idUsuario: req.user.sub }, (err, carritoUsuario) => {
            if (err) return res.status(500).send({ mensaje: 'Error al buscar el carrito' });
    
            if (!carritoUsuario) {
                return res.status(404).send({ mensaje: 'No se encontró el carrito del usuario.' });
            }
    
            // Busca el producto en el carrito
            const productoEnCarrito = carritoUsuario.compras.find(item => item.idProducto.toString() === idProd);
            if (!productoEnCarrito) {
                return res.status(404).send({ mensaje: 'El producto no está en el carrito.' });
            }
    
            // Retorna el producto encontrado
            return res.status(200).send({ mensaje: "Producto encontrado en el carrito", producto: productoEnCarrito });
        });
    }


module.exports = {
    RegistrarCarrito,
    EliminarProductoCarrito,
    agregarCarritoPorIdProducto,
    verCarritosClienteRegistrado,
    actualizarStockProducto,
    eliminarProductoDelCarrito,
    verProductoCarritoPorId
    

}