const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const chatSchema = new Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'usersSocial', // Referencia al modelo de usuarios
    }],
    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: 'Message' // Referencia al último mensaje en el chat
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: { // para saber la última vez que se actualizó el chat (por ejemplo, un nuevo mensaje)
        type: Date,
        default: Date.now
    }
    // Otros campos relevantes, como si el chat está archivado, silenciado, etc.
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
