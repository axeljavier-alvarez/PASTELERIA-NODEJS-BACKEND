const Tarjetas = require('../models/tarjetas.model');


function agregarTarjeta(req, res) {
    var parametros = req.body;
    var tarjetaModel = new Tarjetas();
    
    // Verificar que todos los campos necesarios estén presentes
    if (parametros.numeroTarjeta && parametros.nombreUsuario && 
        parametros.mesExpiracion && parametros.yearExpiracion && 
        parametros.codigoSeguridad) {

        // Convertir el número de tarjeta a cadena
        const numeroTarjetaStr = parametros.numeroTarjeta.toString();

        // Asignar tipo de tarjeta y validar longitud
        if (numeroTarjetaStr.startsWith('4')) {
            tarjetaModel.tipoTarjeta = 'Visa';
            if (numeroTarjetaStr.length < 13 || numeroTarjetaStr.length > 16) {
                return res.status(400).send({ mensaje: 'El número de tarjeta Visa debe tener entre 13 y 16 dígitos.' });
            }
        } else if (numeroTarjetaStr.startsWith('5')) {
            tarjetaModel.tipoTarjeta = 'MasterCard';
            if (numeroTarjetaStr.length !== 16) {
                return res.status(400).send({ mensaje: 'El número de tarjeta MasterCard debe tener exactamente 16 dígitos.' });
            }
        } else if (numeroTarjetaStr.startsWith('6')) {
            tarjetaModel.tipoTarjeta = 'Discover';
            if (numeroTarjetaStr.length !== 16) {
                return res.status(400).send({ mensaje: 'El número de tarjeta Discover debe tener exactamente 16 dígitos.' });
            }
        } else if (numeroTarjetaStr.startsWith('3')) {
            tarjetaModel.tipoTarjeta = 'American Express';
            if (numeroTarjetaStr.length < 15 || numeroTarjetaStr.length > 16) {
                return res.status(400).send({ mensaje: 'El número de tarjeta American Express debe tener entre 15 y 16 dígitos.' });
            }
        } else {
            return res.status(400).send({ mensaje: 'El número de tarjeta no es válido.' });
        }

        // Validar que codigoSeguridad tenga exactamente 3 dígitos
        if (!/^\d{3}$/.test(parametros.codigoSeguridad.toString())) {
            return res.status(400).send({ mensaje: 'El código de seguridad debe tener exactamente 3 dígitos.' });
        }

        tarjetaModel.numeroTarjeta = parametros.numeroTarjeta;
        tarjetaModel.nombreUsuario = parametros.nombreUsuario;
        tarjetaModel.mesExpiracion = parametros.mesExpiracion;
        tarjetaModel.yearExpiracion = parametros.yearExpiracion;
        tarjetaModel.codigoSeguridad = parametros.codigoSeguridad;

        // Verificar si la tarjeta ya existe
        Tarjetas.find({ numeroTarjeta: parametros.numeroTarjeta }, (err, tarjetaEncontrada) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la petición.' });

            if (tarjetaEncontrada.length == 0) {
                tarjetaModel.save((err, tarjetaGuardada) => {
                    if (err) return res.status(500).send({ mensaje: 'Error al agregar la tarjeta.' });
                    if (!tarjetaGuardada) return res.status(500).send({ mensaje: 'Error al agregar la tarjeta.' });
                    
                    return res.status(200).send({ tarjeta: tarjetaGuardada });
                });
            } else {
                return res.status(400).send({ mensaje: 'El número de tarjeta ya está utilizado.' });
            }
        });
    } else {
        return res.status(400).send({ mensaje: 'Debe llenar todos los campos necesarios.' });
    }
}

module.exports = { agregarTarjeta };