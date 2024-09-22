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
    password: {
        type: String,
        required: true
    },
    imageUrl: String,
    bio: String,
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
    
    minecraftUUID: String,
    minecraftToken: String,
    minecraftUsername: String,  // Nuevo campo para almacenar el nombre de usuario de Minecraft
});

const User = mongoose.model('usersSocial', userSocialSchema);

module.exports = User;
