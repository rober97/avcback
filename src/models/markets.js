const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const marketSchema = new Schema({
    nombre: {
        type: String,
        required: true,
        unique: true
    },
    direccion: {
        type: String,
        required: true
    },
    telefono: {
        type: String,
        required: true
    },
    ciudad: {
        type: Schema.Types.ObjectId,
        ref: 'cities',
        required: true
    }
});

const Market = mongoose.model('markets', marketSchema);

module.exports = Market;
