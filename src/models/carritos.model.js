const mongoose = require('mongoose')
var Schema = mongoose.Schema;

var CarritosSchema = Schema({
    idUsuario: {type: Schema.Types.ObjectId, ref: 'Usuarios'},
    compras: [{
        idProducto: { type: Schema.Types.ObjectId, ref: 'Productos' },
        nombreProducto: String,
        marca:String,
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
            telefonoSucursal: String
        }]
    }],
    total: Number
});

module.exports = mongoose.model('Carritos',CarritosSchema);