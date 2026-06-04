const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Mapea la colección `player_stats` que alimenta el plugin de Minecraft.
// El tercer argumento fuerza el nombre exacto de la colección.
const playerStatsSchema = new Schema(
  {
    uuid: String,
    playerName: String,
    kills: { type: Number, default: 0 },
    deaths: { type: Number, default: 0 },
    kdr: { type: Number, default: 0 },
    mobsKilled: { type: Number, default: 0 },
    money: { type: Number, default: 0 },
    blocksBroken: { type: Number, default: 0 },
    blocksPlaced: { type: Number, default: 0 },
    timePlayed: { type: Number, default: 0 },
    distanceWalked: { type: Number, default: 0 },
    itemsCrafted: { type: Number, default: 0 },
    // Rango
    rank: String,
    rankDisplay: String,
    // Experiencia
    xpLevel: { type: Number, default: 0 },
    xpProgress: { type: Number, default: 0 },
    totalExpPoints: { type: Number, default: 0 },
    // Estado en vivo
    health: { type: Number, default: 0 },
    maxHealth: { type: Number, default: 20 },
    foodLevel: { type: Number, default: 0 },
    saturation: { type: Number, default: 0 },
    gameMode: String,
    online: { type: Boolean, default: false },
    // Ubicación
    lastWorld: String,
    lastX: Number,
    lastY: Number,
    lastZ: Number,
    inventoryUsed: { type: Number, default: 0 },
    firstJoin: Number,
    lastSeen: Number,
    updatedAt: Number,
  },
  { collection: "player_stats" }
);

const PlayerStats = mongoose.model("PlayerStats", playerStatsSchema);

module.exports = PlayerStats;
