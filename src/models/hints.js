const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const hintSchema = new Schema({
  frase: {
    type: String,
    required: true,
    trim: true,
  },
  artista: {
    type: String,
    trim: true,
    default: '',
  },
  cancion: {
    type: String,
    trim: true,
    default: '',
  },
  imagen: {
    type: String,
    trim: true,
    default: '',
  },
  reaccionLikes: {
    type: Number,
    default: 0,
  },
  reaccionSuperLikes: {
    type: Number,
    default: 0,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
  estado: {
    type: String,
    default: 'activo', // "activo", "oculto", "borrado"
    enum: ['activo', 'oculto', 'borrado'],
  },
  categoria: {
    type: String,
    default: 'general', // "musical", "motivacional", "divertido", etc.
  },
  reaccionLikes: { type: Number, default: 0 },
  reaccionSuperLikes: { type: Number, default: 0 },
  reaccionSkips: { type: Number, default: 0 },
  reaccionReacts: { type: Number, default: 0 }

});

// Crear modelo
const Hint = mongoose.model('hints', hintSchema);

module.exports = Hint;
