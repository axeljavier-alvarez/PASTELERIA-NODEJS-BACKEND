
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsuarioSchema = Schema({

    nombre: String,
    apellido: String,
    email: String,
    password: String,
    rol: String,
    telefono: Number,
    direccion: String,
    departamento: String,
    municipio: String,
    imagen: String,

    /* nuevo campo que se necesita para el repartidor */
    estadoRepartidor: String,
    idSucursal: { type: Schema.Types.ObjectId, ref: 'Sucursales' }, // Campo añadido
});

module.exports = mongoose.model('Usuarios', UsuarioSchema);