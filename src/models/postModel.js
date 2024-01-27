const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'usersSocial',
        required: true
    },
    imageUrl: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: true
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'usersSocial' // Asumo que quieres hacer referencia a la misma colección que los comentarios.
    }],
    comments: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'usersSocial',
            required: true
        },
        text: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Crear modelo
const PostModel = mongoose.model('postSchema', postSchema);

module.exports = PostModel;
