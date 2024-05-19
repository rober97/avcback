const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const marketSchema = new Schema({
    nombre: {
        type: String,
        required: true,
        unique: true
    },
    direccion: String,
    telefono: String
});

const Market = mongoose.model('markets', marketSchema);

module.exports = Market;
