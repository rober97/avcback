const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const rewardSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    points_required: {
        type: Number,
        required: true,
    },
    command: {
        type: [String], // Cambiado a un array de strings
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    claimedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: [] // Jugadores que ya reclamaron esta recompensa
    }],
    isDaily: {
        type: Boolean,
        default: false // Indica si es una recompensa diaria
    },
    isWeekly: {
        type: Boolean,
        default: false // Indica si es una recompensa semanal
    },
    isMonthly: {
        type: Boolean,
        default: false // Indica si es una recompensa mensual
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: Date, // Fecha de expiración opcional para recompensas temporales
});

const Reward = mongoose.model('Reward', rewardSchema);

module.exports = Reward;
