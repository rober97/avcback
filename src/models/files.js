const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const fileSchema = new Schema({
    nombre: String,
    ubicacion: String,
    type: String,
    id_user: String,
})

// Crear modelo
const File = mongoose.model('files', fileSchema);

module.exports = File;