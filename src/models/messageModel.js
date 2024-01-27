const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const messageSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'usersSocial', // Esto asume que tienes un modelo llamado 'User' para los usuarios.
        required: true
    },
    recipient: {
        type: Schema.Types.ObjectId,
        ref: 'usersSocial',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    read: {
        type: Boolean,
        default: false
    }
});

// Crear modelo
const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
