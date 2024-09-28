// IMPORTACIONES
const express = require('express');
const cors = require('cors');

const app = express();


app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// RUTAS
const UsuariosRutas = require('./src/routes/usuario.routes');

const CategoriasRutas = require('./src/routes/categorias.routes');

const ProductosRutas = require ('./src/routes/productos.routes');

const CarritosRutas = require ('./src/routes/carritos.routes');

const EmpresaRutas = require ('./src/routes/empresa.routes');

const SucursalesRutas = require ('./src/routes/sucursales.routes');

const FacturasRutas = require('./src/routes/facturas.routes');

const PedidosRutas = require('./src/routes/pedidos.routes');

const TarjetasRutas = require('./src/routes/tarjetas.routes');
 
// MIDDLEWARE INTERMEDIARIO
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// CABECERA
app.use(cors());

// CARGA DE RUTAS 
app.use('/api', UsuariosRutas, CategoriasRutas, ProductosRutas, CarritosRutas, 
    EmpresaRutas, SucursalesRutas, FacturasRutas, PedidosRutas, TarjetasRutas);

module.exports = app;
