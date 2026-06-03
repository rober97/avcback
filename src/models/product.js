const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: '' // URL de imagen o emoji/icono
    },
    category: {
        type: String,
        enum: ['key', 'rank'],
        required: true
    },
    priceCLP: {
        type: Number,
        required: true // Precio para Mercado Pago (Chile)
    },
    priceUSD: {
        type: Number,
        required: true // Precio para PayPal (internacional)
    },
    // Comandos que se ejecutan en el servidor al entregar. Soportan el placeholder {player}.
    commands: [{
        type: String
    }],
    active: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0 // Para ordenar el catálogo en el front
    }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
