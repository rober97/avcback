const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userAchievementSchema = new Schema({
    uuid: {
        type: String,
        required: true,
    },
    achievementKey: {
        type: String,
        required: true,
        ref: 'SystemAchievement' // Referencia al modelo de logros del sistema
    },
    progress: {
        type: Number,
        default: 0 // Progreso inicializado en 0
    },
    completed: {
        type: Boolean,
        default: false // Estado de logro completado
    },
    completionDate: {
        type: Date,
        default: null // Fecha de completado si el logro es alcanzado
    }
});

const UserAchievement = mongoose.model('UserAchievement', userAchievementSchema, 'UserAchievement');
module.exports = UserAchievement;
