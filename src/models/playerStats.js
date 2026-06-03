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
    firstJoin: Number,
    lastSeen: Number,
    updatedAt: Number,
  },
  { collection: "player_stats" }
);

const PlayerStats = mongoose.model("PlayerStats", playerStatsSchema);

module.exports = PlayerStats;
