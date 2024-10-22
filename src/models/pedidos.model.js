const mongoose = require('mongoose')
var Schema = mongoose.Schema;

var PedidosSchema = Schema({
    // agregado recientemente
    idUsuario: {type: Schema.Types.ObjectId, ref: 'Usuarios'},

    pagoEfectivo: [{
        idEfectivo: { type: Schema.Types.ObjectId, ref: 'Efectivo' },
        efectivoCliente: Number,
        cambioCliente:Number,
        totalPedido: Number,
        nit: String,
    }],
    
    fecha: Date,
    tiempoEstimado: String,
    tipoPago: String ,
    estadoPedido:String,
    direccionEnvio: String,
    horaEntrega: String,
    metodoEnvio: String,
    descuentos: Number,
    numeroDeOrden: Number,
    pagoConfirmado: String,
    incrementoEnvio: Number,
    departamentoPedido: String,
    municipioPedido: String,
    
    /* campos necesarios para lleva control orden */
    estadoOrden:String,
    horaRepartidorAsignado: Date,
    horaPedidoEntregado: Date,
    
    /* HACE REFERENCIA A USUARIOS */
    datosUsuario: [{
        idUsuario: {type: Schema.Types.ObjectId, ref: 'Usuarios'},
        nombre: String,
        apellido: String,
        email: String,
        telefono: Number
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

    datosCajero: [{
        idCajero: {type: Schema.Types.ObjectId, ref: 'Usuarios'},
        nombre: String,
        apellido: String,
        email: String,
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
    total: Number

});

module.exports = mongoose.model('Pedidos',PedidosSchema);