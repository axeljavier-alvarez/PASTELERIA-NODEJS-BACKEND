const mongoose = require('mongoose')
var Schema = mongoose.Schema;

var FacturasSchema = Schema({
    nit: String,
    fecha: Date,
    
    datosUsuario: [{
        idUsuario: { type: Schema.Types.ObjectId, ref: 'Usuarios' },
        nombre: String,
        apellido: String,
        email: String
    }],
    
    datosTarjeta: [{
        tipoTarjeta: String,
        nombreUsuario: String,

    }],

    datosCajero: [{
        idCajero: {type: Schema.Types.ObjectId, ref: 'Usuarios'},
        nombre: String,
        apellido: String,
        email: String,
    }],
    
    
    datosPedido: [{

        idPedido: { type: Schema.Types.ObjectId, ref: 'Pedidos' },
        fecha: Date,
        tipoPago: String,
        direccionEnvio: String,
        horaEntrega: String,
        metodoEnvio: String,
        descuentos: Number,
        numeroDeOrden: Number,

        pagoEfectivo: [{
            idEfectivo: { type: Schema.Types.ObjectId, ref: 'Efectivo' },
            efectivoCliente: Number,
            cambioCliente:Number,
            totalPedido: Number,
            nit: String
        }],
        
    }],

    compras: [{
        idProducto: { type: Schema.Types.ObjectId, ref: 'Productos' },
        nombreProducto: String,
        cantidad: Number,
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
            telefonoSucursal: String
        }]
    }],
    total: Number

});

module.exports = mongoose.model('Facturas', FacturasSchema);