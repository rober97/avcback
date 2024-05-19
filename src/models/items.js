const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const articuloSchema = new Schema({
    codigo: {
        type: String,
        required: true
    },
    nombre: {
        type: String,
        required: true
    },
    cantidad: {
        type: Number,
        required: true
    },
    precio: {
        type: Number,
        required: true
    },
    precioUnitario: {
        type: Number,
        required: true
    },
    supermercado: {
        type: String,
        required: true
    },
    fecha: {
        type: Date,
        default: Date.now
    }
});

// Crear modelo
const Articulo = mongoose.model('articulos', articuloSchema);

module.exports = Articulo;
