const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const npcSchema = new Schema({
    nombre: String,
    id_npc: Number,
    relacion: String,
    corazones: Number,
    current_inventory: Number,
    current_follow: Number,
    is_son: Number,
    current_procreate: Number,
    name_mother: String,
    name_father: String,
    uuidjugador: String,
    current_look: Number,
    current_job: Number,
    is_hire: Number,
    is_study: Number,
    is_married: Number,
    is_study_activated: Number,
    current_gift: Number,
    texture: String,
    signature: String,
    world: String,
    x: String,
    y: String,
    z: String
})

// Crear modelo
const Npc = mongoose.model('npc', npcSchema);

module.exports = Npc;