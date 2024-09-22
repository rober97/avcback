const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const achievementSchema = new Schema({
    uuid: {
        type: String,
        required: true
    },
    achievement: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    progress: {
        type: Number,
        required: true
    }
});

const Achievement = mongoose.model('Achievement', achievementSchema, 'Achievement'); // Usa 'Achievement' en lugar de la convención plural de mongoose
module.exports = Achievement;