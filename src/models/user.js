const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    nombre: String,
    apellido: String,
    rut: String,
    password: String,
    tipo: String,
    email: String,
})

// Crear modelo
const User = mongoose.model('users', userSchema);

module.exports = User;