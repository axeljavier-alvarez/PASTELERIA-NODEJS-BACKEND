const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TarjetaSchema = Schema({

   numeroTarjeta: Number,
   nombreUsuario: String,
   mesExpiracion: Number,
   yearExpiracion: Number,
   codigoSeguridad: Number,
   tipoTarjeta: String,

});

module.exports = mongoose.model('Tarjetas', TarjetaSchema);