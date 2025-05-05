const mongoose = require('mongoose');

const reaccionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hint',
    required: true
  },
  tipo: {
    type: String,
    enum: ['like', 'skip', 'react'],
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

reaccionSchema.index({ userId: 1, hintId: 1 }, { unique: true });

module.exports = mongoose.model('Reaccion', reaccionSchema);
