const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const playerSchema = new Schema({
    name: String,
    uuid: String,
})

// Crear modelo
const Player = mongoose.model('Player', playerSchema);

module.exports = Player;