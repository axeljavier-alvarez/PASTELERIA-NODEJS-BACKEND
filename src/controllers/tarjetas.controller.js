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

function obtenerTipoTarjeta(numeroTarjetaStr) {
    if (numeroTarjetaStr.startsWith('4')) {
        return 'Visa';
    } else if (numeroTarjetaStr.startsWith('5')) {
        return 'MasterCard';
    } else if (numeroTarjetaStr.startsWith('6')) {
        return 'Discover';
    } else if (numeroTarjetaStr.startsWith('3')) {
        return 'American Express';
    } else {
        return null;
    }
}

function RegistrarTarjetaUno(numeroTarjeta = 4542564589521478, saldo = 45000, nombreUsuario = "Lola Lopez", mesExpiracion = 1, yearExpiracion = 30, codigoSeguridad = 458) {
    var modeloTarjeta = new Tarjetas();

    Tarjetas.find({ numeroTarjeta: numeroTarjeta }, (err, tarjetaEncontrada) => {
        if (err) {
            console.log('Error en la petición');
            return;
        }

        if (tarjetaEncontrada.length > 0) {
            console.log('La tarjeta ya existe');
            return;
        }

        const numeroTarjetaStr = numeroTarjeta.toString();
        const tipoTarjeta = obtenerTipoTarjeta(numeroTarjetaStr);


        if (!tipoTarjeta) {
            console.log('El número de tarjeta no es válido.');
            return;
        }
        

        modeloTarjeta.tipoTarjeta = tipoTarjeta;
        modeloTarjeta.numeroTarjeta = numeroTarjeta;
        modeloTarjeta.saldo = saldo;
        modeloTarjeta.nombreUsuario = nombreUsuario;
        modeloTarjeta.mesExpiracion = mesExpiracion;
        modeloTarjeta.yearExpiracion = yearExpiracion;
        modeloTarjeta.codigoSeguridad = codigoSeguridad;

        modeloTarjeta.save((err, tarjetaGuardada) => {
            if (err) {

                return;
            }
        });
    });
}

function RegistrarTarjetaDos(numeroTarjeta = 4532753489123456, saldo = 450, nombreUsuario = "Juan Pérez", mesExpiracion = 8, yearExpiracion = 26, codigoSeguridad = 231) {
    var modeloTarjeta = new Tarjetas();

    Tarjetas.find({ numeroTarjeta: numeroTarjeta }, (err, tarjetaEncontrada) => {
        if (err) {
            console.log('Error en la petición');
            return;
        }


        if (tarjetaEncontrada.length > 0) {
            console.log('La tarjeta ya existe');
            return;
        }

        const numeroTarjetaStr = numeroTarjeta.toString();
        const tipoTarjeta = obtenerTipoTarjeta(numeroTarjetaStr);


        if (!tipoTarjeta) {
            console.log('El número de tarjeta no es válido.');
            return;
        }

        modeloTarjeta.tipoTarjeta = tipoTarjeta;
        modeloTarjeta.numeroTarjeta = numeroTarjeta;
        modeloTarjeta.saldo = saldo;
        modeloTarjeta.nombreUsuario = nombreUsuario;
        modeloTarjeta.mesExpiracion = mesExpiracion;
        modeloTarjeta.yearExpiracion = yearExpiracion;
        modeloTarjeta.codigoSeguridad = codigoSeguridad;

        modeloTarjeta.save((err, tarjetaGuardada) => {
            if (err) {

                return;
            }
        });
    });
}

function RegistrarTarjetaTres(numeroTarjeta = 5498567345091234, saldo = 1020, nombreUsuario = "Ana García", mesExpiracion = 12, yearExpiracion = 25, codigoSeguridad = 874) {
    var modeloTarjeta = new Tarjetas();

    Tarjetas.find({ numeroTarjeta: numeroTarjeta }, (err, tarjetaEncontrada) => {
        if (err) {
            console.log('Error en la petición');
            return;
        }


        if (tarjetaEncontrada.length > 0) {
            console.log('La tarjeta ya existe');
            return;
        }

        const numeroTarjetaStr = numeroTarjeta.toString();
        const tipoTarjeta = obtenerTipoTarjeta(numeroTarjetaStr);


        if (!tipoTarjeta) {
            console.log('El número de tarjeta no es válido.');
            return;
        }

        modeloTarjeta.tipoTarjeta = tipoTarjeta;
        modeloTarjeta.numeroTarjeta = numeroTarjeta;
        modeloTarjeta.saldo = saldo;
        modeloTarjeta.nombreUsuario = nombreUsuario;
        modeloTarjeta.mesExpiracion = mesExpiracion;
        modeloTarjeta.yearExpiracion = yearExpiracion;
        modeloTarjeta.codigoSeguridad = codigoSeguridad;

        modeloTarjeta.save((err, tarjetaGuardada) => {
            if (err) {

                return;
            }
        });
    });
}

function RegistrarTarjetaCuatro(numeroTarjeta = 6011987643211234, saldo = 500, nombreUsuario = "Carlos Soto", mesExpiracion = 5, yearExpiracion = 27, codigoSeguridad = 654) {
    var modeloTarjeta = new Tarjetas();

    Tarjetas.find({ numeroTarjeta: numeroTarjeta }, (err, tarjetaEncontrada) => {
        if (err) {
            console.log('Error en la petición');
            return;
        }


        if (tarjetaEncontrada.length > 0) {
            console.log('La tarjeta ya existe');
            return;
        }

        const numeroTarjetaStr = numeroTarjeta.toString();
        const tipoTarjeta = obtenerTipoTarjeta(numeroTarjetaStr);


        if (!tipoTarjeta) {
            console.log('El número de tarjeta no es válido.');
            return;
        }

        modeloTarjeta.tipoTarjeta = tipoTarjeta;
        modeloTarjeta.numeroTarjeta = numeroTarjeta;
        modeloTarjeta.saldo = saldo;
        modeloTarjeta.nombreUsuario = nombreUsuario;
        modeloTarjeta.mesExpiracion = mesExpiracion;
        modeloTarjeta.yearExpiracion = yearExpiracion;
        modeloTarjeta.codigoSeguridad = codigoSeguridad;

        modeloTarjeta.save((err, tarjetaGuardada) => {
            if (err) {

                return;
            }
        });
    });
}

function RegistrarTarjetaCinco(numeroTarjeta = 371449635398431, saldo = 750, nombreUsuario = "Laura Martínez", mesExpiracion = 7, yearExpiracion = 28, codigoSeguridad = 113) {
    var modeloTarjeta = new Tarjetas();

    Tarjetas.find({ numeroTarjeta: numeroTarjeta }, (err, tarjetaEncontrada) => {
        if (err) {
            console.log('Error en la petición');
            return;
        }


        if (tarjetaEncontrada.length > 0) {
            console.log('La tarjeta ya existe');
            return;
        }

        const numeroTarjetaStr = numeroTarjeta.toString();
        const tipoTarjeta = obtenerTipoTarjeta(numeroTarjetaStr);


        if (!tipoTarjeta) {
            console.log('El número de tarjeta no es válido.');
            return;
        }

        modeloTarjeta.tipoTarjeta = tipoTarjeta;
        modeloTarjeta.numeroTarjeta = numeroTarjeta;
        modeloTarjeta.saldo = saldo;
        modeloTarjeta.nombreUsuario = nombreUsuario;
        modeloTarjeta.mesExpiracion = mesExpiracion;
        modeloTarjeta.yearExpiracion = yearExpiracion;
        modeloTarjeta.codigoSeguridad = codigoSeguridad;

        modeloTarjeta.save((err, tarjetaGuardada) => {
            if (err) {

                return;
            }
        });
    });
}


function RegistrarTarjetaSeis(numeroTarjeta = 4929123456789012, saldo = 14200, nombreUsuario = "Roberto Díaz", mesExpiracion = 10, yearExpiracion = 24, codigoSeguridad = 227) {
    var modeloTarjeta = new Tarjetas();

    Tarjetas.find({ numeroTarjeta: numeroTarjeta }, (err, tarjetaEncontrada) => {
        if (err) {
            console.log('Error en la petición');
            return;
        }


        if (tarjetaEncontrada.length > 0) {
            console.log('La tarjeta ya existe');
            return;
        }

        const numeroTarjetaStr = numeroTarjeta.toString();
        const tipoTarjeta = obtenerTipoTarjeta(numeroTarjetaStr);


        if (!tipoTarjeta) {
            console.log('El número de tarjeta no es válido.');
            return;
        }

        modeloTarjeta.tipoTarjeta = tipoTarjeta;
        modeloTarjeta.numeroTarjeta = numeroTarjeta;
        modeloTarjeta.saldo = saldo;
        modeloTarjeta.nombreUsuario = nombreUsuario;
        modeloTarjeta.mesExpiracion = mesExpiracion;
        modeloTarjeta.yearExpiracion = yearExpiracion;
        modeloTarjeta.codigoSeguridad = codigoSeguridad;

        modeloTarjeta.save((err, tarjetaGuardada) => {
            if (err) {

                return;
            }
        });
    });
}

function RegistrarTarjetaSiete(numeroTarjeta = 5362876543219876, saldo = 85200, nombreUsuario = "Elena López", mesExpiracion = 4, yearExpiracion = 23, codigoSeguridad = 482) {
    var modeloTarjeta = new Tarjetas();

    Tarjetas.find({ numeroTarjeta: numeroTarjeta }, (err, tarjetaEncontrada) => {
        if (err) {
            console.log('Error en la petición');
            return;
        }


        if (tarjetaEncontrada.length > 0) {
            console.log('La tarjeta ya existe');
            return;
        }

        const numeroTarjetaStr = numeroTarjeta.toString();
        const tipoTarjeta = obtenerTipoTarjeta(numeroTarjetaStr);


        if (!tipoTarjeta) {
            console.log('El número de tarjeta no es válido.');
            return;
        }

        modeloTarjeta.tipoTarjeta = tipoTarjeta;
        modeloTarjeta.numeroTarjeta = numeroTarjeta;
        modeloTarjeta.saldo = saldo;
        modeloTarjeta.nombreUsuario = nombreUsuario;
        modeloTarjeta.mesExpiracion = mesExpiracion;
        modeloTarjeta.yearExpiracion = yearExpiracion;
        modeloTarjeta.codigoSeguridad = codigoSeguridad;

        modeloTarjeta.save((err, tarjetaGuardada) => {
            if (err) {

                return;
            }
        });
    });
}

function RegistrarTarjetaOcho(numeroTarjeta = 6011123456784321, saldo = 85200, nombreUsuario = "Marcos Hernández", mesExpiracion = 11, yearExpiracion = 29, codigoSeguridad = 621) {
    var modeloTarjeta = new Tarjetas();

    Tarjetas.find({ numeroTarjeta: numeroTarjeta }, (err, tarjetaEncontrada) => {
        if (err) {
            console.log('Error en la petición');
            return;
        }


        if (tarjetaEncontrada.length > 0) {
            console.log('La tarjeta ya existe');
            return;
        }

        const numeroTarjetaStr = numeroTarjeta.toString();
        const tipoTarjeta = obtenerTipoTarjeta(numeroTarjetaStr);


        if (!tipoTarjeta) {
            console.log('El número de tarjeta no es válido.');
            return;
        }

        modeloTarjeta.tipoTarjeta = tipoTarjeta;
        modeloTarjeta.numeroTarjeta = numeroTarjeta;
        modeloTarjeta.saldo = saldo;
        modeloTarjeta.nombreUsuario = nombreUsuario;
        modeloTarjeta.mesExpiracion = mesExpiracion;
        modeloTarjeta.yearExpiracion = yearExpiracion;
        modeloTarjeta.codigoSeguridad = codigoSeguridad;

        modeloTarjeta.save((err, tarjetaGuardada) => {
            if (err) {

                return;
            }
        });
    });
}

function RegistrarTarjetaNueve(numeroTarjeta = 378282246310005, saldo = 1893, nombreUsuario = "Diana Torres", mesExpiracion = 3, yearExpiracion = 26, codigoSeguridad = 589) {
    var modeloTarjeta = new Tarjetas();

    Tarjetas.find({ numeroTarjeta: numeroTarjeta }, (err, tarjetaEncontrada) => {
        if (err) {
            console.log('Error en la petición');
            return;
        }


        if (tarjetaEncontrada.length > 0) {
            console.log('La tarjeta ya existe');
            return;
        }

        const numeroTarjetaStr = numeroTarjeta.toString();
        const tipoTarjeta = obtenerTipoTarjeta(numeroTarjetaStr);


        if (!tipoTarjeta) {
            console.log('El número de tarjeta no es válido.');
            return;
        }

        modeloTarjeta.tipoTarjeta = tipoTarjeta;
        modeloTarjeta.numeroTarjeta = numeroTarjeta;
        modeloTarjeta.saldo = saldo;
        modeloTarjeta.nombreUsuario = nombreUsuario;
        modeloTarjeta.mesExpiracion = mesExpiracion;
        modeloTarjeta.yearExpiracion = yearExpiracion;
        modeloTarjeta.codigoSeguridad = codigoSeguridad;

        modeloTarjeta.save((err, tarjetaGuardada) => {
            if (err) {

                return;
            }
        });
    });
}

function RegistrarTarjetaDiez(numeroTarjeta = 4111111111111111, saldo = 20000, nombreUsuario = "Andrea Ruiz", mesExpiracion = 9, yearExpiracion = 30, codigoSeguridad = 178) {
    var modeloTarjeta = new Tarjetas();

    Tarjetas.find({ numeroTarjeta: numeroTarjeta }, (err, tarjetaEncontrada) => {
        if (err) {
            console.log('Error en la petición');
            return;
        }


        if (tarjetaEncontrada.length > 0) {
            console.log('La tarjeta ya existe');
            return;
        }

        const numeroTarjetaStr = numeroTarjeta.toString();
        const tipoTarjeta = obtenerTipoTarjeta(numeroTarjetaStr);


        if (!tipoTarjeta) {
            console.log('El número de tarjeta no es válido.');
            return;
        }

        modeloTarjeta.tipoTarjeta = tipoTarjeta;
        modeloTarjeta.numeroTarjeta = numeroTarjeta;
        modeloTarjeta.saldo = saldo;
        modeloTarjeta.nombreUsuario = nombreUsuario;
        modeloTarjeta.mesExpiracion = mesExpiracion;
        modeloTarjeta.yearExpiracion = yearExpiracion;
        modeloTarjeta.codigoSeguridad = codigoSeguridad;

        modeloTarjeta.save((err, tarjetaGuardada) => {
            if (err) {

                return;
            }
        });
    });
}

function RegistrarTarjetaOnce(numeroTarjeta = 5105105105105100, saldo = 20000, nombreUsuario = "Fernando Gómez", mesExpiracion = 9, yearExpiracion = 30, codigoSeguridad = 178) {
    var modeloTarjeta = new Tarjetas();

    Tarjetas.find({ numeroTarjeta: numeroTarjeta }, (err, tarjetaEncontrada) => {
        if (err) {
            console.log('Error en la petición');
            return;
        }


        if (tarjetaEncontrada.length > 0) {
            console.log('La tarjeta ya existe');
            return;
        }

        const numeroTarjetaStr = numeroTarjeta.toString();
        const tipoTarjeta = obtenerTipoTarjeta(numeroTarjetaStr);


        if (!tipoTarjeta) {
            console.log('El número de tarjeta no es válido.');
            return;
        }

        modeloTarjeta.tipoTarjeta = tipoTarjeta;
        modeloTarjeta.numeroTarjeta = numeroTarjeta;
        modeloTarjeta.saldo = saldo;
        modeloTarjeta.nombreUsuario = nombreUsuario;
        modeloTarjeta.mesExpiracion = mesExpiracion;
        modeloTarjeta.yearExpiracion = yearExpiracion;
        modeloTarjeta.codigoSeguridad = codigoSeguridad;

        modeloTarjeta.save((err, tarjetaGuardada) => {
            if (err) {

                return;
            }
        });
    });
}

function RegistrarTarjetaDoce(numeroTarjeta = 6011000990139424, saldo = 14200, nombreUsuario = "Patricia Salas", mesExpiracion = 1, yearExpiracion = 26, codigoSeguridad = 321) {
    var modeloTarjeta = new Tarjetas();

    Tarjetas.find({ numeroTarjeta: numeroTarjeta }, (err, tarjetaEncontrada) => {
        if (err) {
            console.log('Error en la petición');
            return;
        }


        if (tarjetaEncontrada.length > 0) {
            console.log('La tarjeta ya existe');
            return;
        }

        const numeroTarjetaStr = numeroTarjeta.toString();
        const tipoTarjeta = obtenerTipoTarjeta(numeroTarjetaStr);


        if (!tipoTarjeta) {
            console.log('El número de tarjeta no es válido.');
            return;
        }

        modeloTarjeta.tipoTarjeta = tipoTarjeta;
        modeloTarjeta.numeroTarjeta = numeroTarjeta;
        modeloTarjeta.saldo = saldo;
        modeloTarjeta.nombreUsuario = nombreUsuario;
        modeloTarjeta.mesExpiracion = mesExpiracion;
        modeloTarjeta.yearExpiracion = yearExpiracion;
        modeloTarjeta.codigoSeguridad = codigoSeguridad;

        modeloTarjeta.save((err, tarjetaGuardada) => {
            if (err) {

                return;
            }
        });
    });
}

function RegistrarTarjetaTrece(numeroTarjeta = 371449635398430, saldo = 1200, nombreUsuario = "Martín Ramírez", mesExpiracion = 7, yearExpiracion = 28, codigoSeguridad = 134) {
    var modeloTarjeta = new Tarjetas();

    Tarjetas.find({ numeroTarjeta: numeroTarjeta }, (err, tarjetaEncontrada) => {
        if (err) {
            console.log('Error en la petición');
            return;
        }


        if (tarjetaEncontrada.length > 0) {
            console.log('La tarjeta ya existe');
            return;
        }

        const numeroTarjetaStr = numeroTarjeta.toString();
        const tipoTarjeta = obtenerTipoTarjeta(numeroTarjetaStr);


        if (!tipoTarjeta) {
            console.log('El número de tarjeta no es válido.');
            return;
        }

        modeloTarjeta.tipoTarjeta = tipoTarjeta;
        modeloTarjeta.numeroTarjeta = numeroTarjeta;
        modeloTarjeta.saldo = saldo;
        modeloTarjeta.nombreUsuario = nombreUsuario;
        modeloTarjeta.mesExpiracion = mesExpiracion;
        modeloTarjeta.yearExpiracion = yearExpiracion;
        modeloTarjeta.codigoSeguridad = codigoSeguridad;

        modeloTarjeta.save((err, tarjetaGuardada) => {
            if (err) {

                return;
            }
        });
    });
}

function RegistrarTarjetaCatorce(numeroTarjeta = 4556737586899855, saldo = 30, nombreUsuario = "Samuel Cruz", mesExpiracion = 9, yearExpiracion = 26, codigoSeguridad = 442) {
    var modeloTarjeta = new Tarjetas();

    Tarjetas.find({ numeroTarjeta: numeroTarjeta }, (err, tarjetaEncontrada) => {
        if (err) {
            console.log('Error en la petición');
            return;
        }


        if (tarjetaEncontrada.length > 0) {
            console.log('La tarjeta ya existe');
            return;
        }

        const numeroTarjetaStr = numeroTarjeta.toString();
        const tipoTarjeta = obtenerTipoTarjeta(numeroTarjetaStr);


        if (!tipoTarjeta) {
            console.log('El número de tarjeta no es válido.');
            return;
        }

        modeloTarjeta.tipoTarjeta = tipoTarjeta;
        modeloTarjeta.numeroTarjeta = numeroTarjeta;
        modeloTarjeta.saldo = saldo;
        modeloTarjeta.nombreUsuario = nombreUsuario;
        modeloTarjeta.mesExpiracion = mesExpiracion;
        modeloTarjeta.yearExpiracion = yearExpiracion;
        modeloTarjeta.codigoSeguridad = codigoSeguridad;

        modeloTarjeta.save((err, tarjetaGuardada) => {
            if (err) {

                return;
            }
        });
    });
}

function RegistrarTarjetaQuince(numeroTarjeta = 5212761234567890, saldo = 15, nombreUsuario = "Claudia Pérez", mesExpiracion = 10, yearExpiracion = 26, codigoSeguridad = 442) {
    var modeloTarjeta = new Tarjetas();

    Tarjetas.find({ numeroTarjeta: numeroTarjeta }, (err, tarjetaEncontrada) => {
        if (err) {
            console.log('Error en la petición');
            return;
        }


        if (tarjetaEncontrada.length > 0) {
            console.log('La tarjeta ya existe');
            return;
        }

        const numeroTarjetaStr = numeroTarjeta.toString();
        const tipoTarjeta = obtenerTipoTarjeta(numeroTarjetaStr);


        if (!tipoTarjeta) {
            console.log('El número de tarjeta no es válido.');
            return;
        }

        modeloTarjeta.tipoTarjeta = tipoTarjeta;
        modeloTarjeta.numeroTarjeta = numeroTarjeta;
        modeloTarjeta.saldo = saldo;
        modeloTarjeta.nombreUsuario = nombreUsuario;
        modeloTarjeta.mesExpiracion = mesExpiracion;
        modeloTarjeta.yearExpiracion = yearExpiracion;
        modeloTarjeta.codigoSeguridad = codigoSeguridad;

        modeloTarjeta.save((err, tarjetaGuardada) => {
            if (err) {

                return;
            }
        });
    });
}

function RegistrarTarjetaDieciseis(numeroTarjeta = 6011123432109876, saldo = 100, nombreUsuario = "Alejandro Moreno", mesExpiracion = 5, yearExpiracion = 32, codigoSeguridad = 984) {
    var modeloTarjeta = new Tarjetas();

    Tarjetas.find({ numeroTarjeta: numeroTarjeta }, (err, tarjetaEncontrada) => {
        if (err) {
            console.log('Error en la petición');
            return;
        }


        if (tarjetaEncontrada.length > 0) {
            console.log('La tarjeta ya existe');
            return;
        }

        const numeroTarjetaStr = numeroTarjeta.toString();
        const tipoTarjeta = obtenerTipoTarjeta(numeroTarjetaStr);


        if (!tipoTarjeta) {
            console.log('El número de tarjeta no es válido.');
            return;
        }

        modeloTarjeta.tipoTarjeta = tipoTarjeta;
        modeloTarjeta.numeroTarjeta = numeroTarjeta;
        modeloTarjeta.saldo = saldo;
        modeloTarjeta.nombreUsuario = nombreUsuario;
        modeloTarjeta.mesExpiracion = mesExpiracion;
        modeloTarjeta.yearExpiracion = yearExpiracion;
        modeloTarjeta.codigoSeguridad = codigoSeguridad;

        modeloTarjeta.save((err, tarjetaGuardada) => {
            if (err) {

                return;
            }
        });
    });
}

function RegistrarTarjetaDiecisiete(numeroTarjeta = 378282246310006, saldo = 100, nombreUsuario = "Sofía Jiménez", mesExpiracion = 11, yearExpiracion = 25, codigoSeguridad = 945) {
    var modeloTarjeta = new Tarjetas();

    Tarjetas.find({ numeroTarjeta: numeroTarjeta }, (err, tarjetaEncontrada) => {
        if (err) {
            console.log('Error en la petición');
            return;
        }


        if (tarjetaEncontrada.length > 0) {
            console.log('La tarjeta ya existe');
            return;
        }

        const numeroTarjetaStr = numeroTarjeta.toString();
        const tipoTarjeta = obtenerTipoTarjeta(numeroTarjetaStr);


        if (!tipoTarjeta) {
            console.log('El número de tarjeta no es válido.');
            return;
        }

        modeloTarjeta.tipoTarjeta = tipoTarjeta;
        modeloTarjeta.numeroTarjeta = numeroTarjeta;
        modeloTarjeta.saldo = saldo;
        modeloTarjeta.nombreUsuario = nombreUsuario;
        modeloTarjeta.mesExpiracion = mesExpiracion;
        modeloTarjeta.yearExpiracion = yearExpiracion;
        modeloTarjeta.codigoSeguridad = codigoSeguridad;

        modeloTarjeta.save((err, tarjetaGuardada) => {
            if (err) {

                return;
            }
        });
    });
}

function RegistrarTarjetaDieciocho(numeroTarjeta = 4485428235432567, saldo = 100, nombreUsuario = "Matías Fernández", mesExpiracion = 1, yearExpiracion = 26, codigoSeguridad = 805) {
    var modeloTarjeta = new Tarjetas();

    Tarjetas.find({ numeroTarjeta: numeroTarjeta }, (err, tarjetaEncontrada) => {
        if (err) {
            console.log('Error en la petición');
            return;
        }


        if (tarjetaEncontrada.length > 0) {
            console.log('La tarjeta ya existe');
            return;
        }

        const numeroTarjetaStr = numeroTarjeta.toString();
        const tipoTarjeta = obtenerTipoTarjeta(numeroTarjetaStr);


        if (!tipoTarjeta) {
            console.log('El número de tarjeta no es válido.');
            return;
        }

        modeloTarjeta.tipoTarjeta = tipoTarjeta;
        modeloTarjeta.numeroTarjeta = numeroTarjeta;
        modeloTarjeta.saldo = saldo;
        modeloTarjeta.nombreUsuario = nombreUsuario;
        modeloTarjeta.mesExpiracion = mesExpiracion;
        modeloTarjeta.yearExpiracion = yearExpiracion;
        modeloTarjeta.codigoSeguridad = codigoSeguridad;

        modeloTarjeta.save((err, tarjetaGuardada) => {
            if (err) {

                return;
            }
        });
    });
}

function RegistrarTarjetaDiecinueve(numeroTarjeta = 5291738945234567, saldo = 20500, nombreUsuario = "Verónica Luna", mesExpiracion = 6, yearExpiracion = 26, codigoSeguridad = 636) {
    var modeloTarjeta = new Tarjetas();

    Tarjetas.find({ numeroTarjeta: numeroTarjeta }, (err, tarjetaEncontrada) => {
        if (err) {
            console.log('Error en la petición');
            return;
        }


        if (tarjetaEncontrada.length > 0) {
            console.log('La tarjeta ya existe');
            return;
        }

        const numeroTarjetaStr = numeroTarjeta.toString();
        const tipoTarjeta = obtenerTipoTarjeta(numeroTarjetaStr);


        if (!tipoTarjeta) {
            console.log('El número de tarjeta no es válido.');
            return;
        }

        modeloTarjeta.tipoTarjeta = tipoTarjeta;
        modeloTarjeta.numeroTarjeta = numeroTarjeta;
        modeloTarjeta.saldo = saldo;
        modeloTarjeta.nombreUsuario = nombreUsuario;
        modeloTarjeta.mesExpiracion = mesExpiracion;
        modeloTarjeta.yearExpiracion = yearExpiracion;
        modeloTarjeta.codigoSeguridad = codigoSeguridad;

        modeloTarjeta.save((err, tarjetaGuardada) => {
            if (err) {

                return;
            }
        });
    });
}

function RegistrarTarjetaVeinte(numeroTarjeta = 6011003486987421, saldo = 1000, nombreUsuario = "Nicolás Reyes", mesExpiracion = 3, yearExpiracion = 27, codigoSeguridad = 425) {
    var modeloTarjeta = new Tarjetas();

    Tarjetas.find({ numeroTarjeta: numeroTarjeta }, (err, tarjetaEncontrada) => {
        if (err) {
            console.log('Error en la petición');
            return;
        }


        if (tarjetaEncontrada.length > 0) {
            console.log('La tarjeta ya existe');
            return;
        }

        const numeroTarjetaStr = numeroTarjeta.toString();
        const tipoTarjeta = obtenerTipoTarjeta(numeroTarjetaStr);


        if (!tipoTarjeta) {
            console.log('El número de tarjeta no es válido.');
            return;
        }

        modeloTarjeta.tipoTarjeta = tipoTarjeta;
        modeloTarjeta.numeroTarjeta = numeroTarjeta;
        modeloTarjeta.saldo = saldo;
        modeloTarjeta.nombreUsuario = nombreUsuario;
        modeloTarjeta.mesExpiracion = mesExpiracion;
        modeloTarjeta.yearExpiracion = yearExpiracion;
        modeloTarjeta.codigoSeguridad = codigoSeguridad;

        modeloTarjeta.save((err, tarjetaGuardada) => {
            if (err) {

                return;
            }
        });
    });
}

module.exports = {
    agregarTarjeta, RegistrarTarjetaUno, RegistrarTarjetaDos, RegistrarTarjetaTres, RegistrarTarjetaCuatro,
    RegistrarTarjetaCinco, RegistrarTarjetaSeis, RegistrarTarjetaSiete, RegistrarTarjetaSiete, RegistrarTarjetaOcho, RegistrarTarjetaOcho, RegistrarTarjetaNueve, RegistrarTarjetaDiez, RegistrarTarjetaOnce, RegistrarTarjetaDoce, RegistrarTarjetaTrece, RegistrarTarjetaCatorce, RegistrarTarjetaQuince, RegistrarTarjetaDieciseis, RegistrarTarjetaDiecisiete, RegistrarTarjetaDieciocho, RegistrarTarjetaDiecinueve, RegistrarTarjetaVeinte
};