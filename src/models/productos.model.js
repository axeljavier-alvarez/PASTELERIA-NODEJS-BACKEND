
const mongoose = require('mongoose')
var Schema = mongoose.Schema;

var ProductosSchema = Schema({
    nombreProducto: String,
    marca:String,
    descripcion:String,
    stock: Number,
    precio: Number,
    vendido:Number,
    imagen: String,
    size: String,
    estado: String,

    descripcionCategoria: [{

        idCategoria: {type:Schema.Types.ObjectId,ref:'Categorias'},
        nombreCategoria: String,
    }],

    datosSucursal: [{
        idSucursal: {type:Schema.Types.ObjectId,ref:'Sucursales'},
        nombreSucursal: String,
        direccionSucursal: String,
        telefonoSucursal: Number,
        departamento: String, // Asegúrate de que este campo exista
        municipio: String // Asegúrate de que este campo exista
    }]

});

module.exports = mongoose.model('Productos',ProductosSchema);
