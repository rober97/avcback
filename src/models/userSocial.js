const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSocialSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    mail: {
        type: String,
        required: true,
        unique: true
    },
    password: { // Asegúrate de nunca guardar contraseñas en texto plano. Siempre usa algún método de hash como bcrypt.
        type: String,
        required: true
    },

    imageUrl: { // Asegúrate de nunca guardar contraseñas en texto plano. Siempre usa algún método de hash como bcrypt.
        type: String,
        required: false
    },
    bio: { // Asegúrate de nunca guardar contraseñas en texto plano. Siempre usa algún método de hash como bcrypt.
        type: String,
        required: false
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    likesGiven: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    // puedes agregar más campos como email, nombre completo, etc. según las necesidades
});

// Crear modelo
const User = mongoose.model('usersSocial', userSocialSchema);

module.exports = User;