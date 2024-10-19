const mongoose = require('mongoose')
var Schema = mongoose.Schema;

var EfectivoSchema = Schema({
    efectivoCliente: Number,
    cambioCliente:Number,
    totalPedido: Number,
    nit: String

});

module.exports = mongoose.model('Efectivo', EfectivoSchema);