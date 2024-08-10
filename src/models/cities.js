const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const citySchema = new Schema({
    nombre: {
        type: String,
        required: true,
        unique: true
    },
    codigo: {
        type: String,
        unique: true,
        sparse: true // Permite valores nulos o vacíos para este campo
    },
    pais: {
        type: String,
        required: true
    },
    estado: {
        type: String,
        required: false
    },
    latitud: {
        type: Number,
        required: false
    },
    longitud: {
        type: Number,
        required: false
    },
    poblacion: {
        type: Number,
        required: false
    }
});

const City = mongoose.model('cities', citySchema);

module.exports = City;
