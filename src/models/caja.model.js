const mongoose = require('mongoose')
var Schema = mongoose.Schema;

var CajaSchema = Schema({
    efectivoGeneral: Number,
    vueltosCliente:Number,
    
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

      
    }],

});


module.exports = mongoose.model('Caja',CajaSchema);
