const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'usersSocial',
        required: true
    },
    // Snapshot del nombre de Minecraft al momento de la compra (destinatario de la entrega)
    minecraftUsername: {
        type: String,
        required: true
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: {
        type: String // Snapshot del nombre del producto
    },
    provider: {
        type: String,
        enum: ['mercadopago', 'paypal'],
        required: true
    },
    // Referencia del proveedor: preferenceId (MP) u orderId (PayPal)
    providerRef: {
        type: String,
        index: true
    },
    // Id del pago/captura ya confirmado por el proveedor
    paymentId: {
        type: String
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true // CLP | USD
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'delivered', 'failed', 'refunded'],
        default: 'pending'
    },
    // Garantiza que la entrega de comandos al servidor ocurra una sola vez (idempotencia)
    delivered: {
        type: Boolean,
        default: false
    },
    paidAt: {
        type: Date
    },
    deliveredAt: {
        type: Date
    }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
