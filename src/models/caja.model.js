const mongoose = require('mongoose')
var Schema = mongoose.Schema;

var CajaSchema = Schema({
    efectivoGeneral: Number,
    vueltosCliente:Number,
    totalPedidosCredito: Number,
    totalPedidosEfectivo: Number,
    totalEfectivoFactura: Number,


    datosSucursal: [{
        idSucursal: { type: Schema.Types.ObjectId, ref: 'Sucursales' },
        nombreSucursal: String,
        direccionSucursal: String,
        telefonoSucursal: String,
        departamento: String,
        municipio: String
    }], 
    
    historialPedidosEfectivo: [{

        idPedido: { type: Schema.Types.ObjectId, ref: 'Pedidos' },
        fecha: Date,
        tipoPago: String,
        direccionEnvio: String,
        horaEntrega: String,
        metodoEnvio: String,
        descuentos: Number,
        numeroDeOrden: Number,
        estadoPedido:String,
        incrementoEnvio: Number,
        estadoOrden:String,
        horaRepartidorAsignado: Date,
        horaPedidoEntregado: Date,

        total: Number,

        pagoEfectivo: [{
            idEfectivo: { type: Schema.Types.ObjectId, ref: 'Efectivo' },
            efectivoCliente: Number,
            cambioCliente:Number,
            totalPedido: Number
        }],

        compras: [{
            idProducto: {type:Schema.Types.ObjectId,ref:'Productos'},
            nombreProducto: String,
            marca: String,
            cantidad: Number,
            size:String,
            precio: Number,
            subTotal: Number,
            descripcionCategoria: [{
                idCategoria: { type: Schema.Types.ObjectId, ref: 'Categorias' },
                nombreCategoria: String,
            }],
            datosSucursal: [{
                idSucursal: { type: Schema.Types.ObjectId, ref: 'Sucursales' },
                nombreSucursal: String,
                direccionSucursal: String,
                telefonoSucursal: String,
                departamento: String,
                municipio: String
            }],
            
        }],
      
    }],




    historialPedidosCredito: [{

        idPedido: { type: Schema.Types.ObjectId, ref: 'Pedidos' },
        fecha: Date,
        tipoPago: String,
        direccionEnvio: String,
        horaEntrega: String,
        metodoEnvio: String,
        descuentos: Number,
        numeroDeOrden: Number,
        estadoPedido:String,
        incrementoEnvio: Number,
        estadoOrden:String,
        horaRepartidorAsignado: Date,
        horaPedidoEntregado: Date,
        total: Number,
        pagoEfectivo: [{
            idEfectivo: { type: Schema.Types.ObjectId, ref: 'Efectivo' },
            efectivoCliente: Number,
            cambioCliente:Number,
            totalPedido: Number
        }],

        repartidorAsignado: [{

            idRepartidor: {type: Schema.Types.ObjectId, ref: 'Usuarios'},
            nombre: String,
            apellido: String,
            email: String,
            telefono: Number,
            rol: String,
            estadoRepartidor: String
        }],

        compras: [{
            idProducto: {type:Schema.Types.ObjectId,ref:'Productos'},
            nombreProducto: String,
            marca: String,
            cantidad: Number,
            size:String,
            precio: Number,
            subTotal: Number,
            descripcionCategoria: [{
                idCategoria: { type: Schema.Types.ObjectId, ref: 'Categorias' },
                nombreCategoria: String,
            }],
            datosSucursal: [{
                idSucursal: { type: Schema.Types.ObjectId, ref: 'Sucursales' },
                nombreSucursal: String,
                direccionSucursal: String,
                telefonoSucursal: String,
                departamento: String,
                municipio: String
            }],
            
        }],

      
    }],


    
    historialPedidosEntregadosEfectivo: [{

        idPedido: { type: Schema.Types.ObjectId, ref: 'Pedidos' },
        fecha: Date,
        tipoPago: String,
        direccionEnvio: String,
        horaEntrega: String,
        metodoEnvio: String,
        descuentos: Number,
        numeroDeOrden: Number,
        estadoPedido:String,
        incrementoEnvio: Number,
        estadoOrden:String,
        horaRepartidorAsignado: Date,
        horaPedidoEntregado: Date,

        pagoEfectivo: [{
            idEfectivo: { type: Schema.Types.ObjectId, ref: 'Efectivo' },
            efectivoCliente: Number,
            cambioCliente:Number,
            totalPedido: Number
        }],

        repartidorAsignado: [{

            idRepartidor: {type: Schema.Types.ObjectId, ref: 'Usuarios'},
            nombre: String,
            apellido: String,
            email: String,
            telefono: Number,
            rol: String,
            estadoRepartidor: String
        }],


        compras: [{
            idProducto: {type:Schema.Types.ObjectId,ref:'Productos'},
            nombreProducto: String,
            marca: String,
            cantidad: Number,
            size:String,
            precio: Number,
            subTotal: Number,
            descripcionCategoria: [{
                idCategoria: { type: Schema.Types.ObjectId, ref: 'Categorias' },
                nombreCategoria: String,
            }],
            datosSucursal: [{
                idSucursal: { type: Schema.Types.ObjectId, ref: 'Sucursales' },
                nombreSucursal: String,
                direccionSucursal: String,
                telefonoSucursal: String,
                departamento: String,
                municipio: String
            }],
            
        }],

      
    }],


});


module.exports = mongoose.model('Caja',CajaSchema);
