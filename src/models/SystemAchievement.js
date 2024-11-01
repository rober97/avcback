const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const systemAchievementSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true // Cada logro tiene una clave única
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    target: {
        type: String,
        required: true
    },
    count: {
        type: Number,
        required: true
    }
});

const SystemAchievement = mongoose.model('SystemAchievement', systemAchievementSchema, 'SystemAchievement');
module.exports = SystemAchievement;
