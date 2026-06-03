const PlayerStats = require("../models/playerStats");

// Campos por los que se permite ordenar el ranking (whitelist para evitar inyección).
const SORTABLE = {
  kills: "kills",
  deaths: "deaths",
  kdr: "kdr",
  mobsKilled: "mobsKilled",
  money: "money",
  blocksBroken: "blocksBroken",
  blocksPlaced: "blocksPlaced",
  timePlayed: "timePlayed",
  distanceWalked: "distanceWalked",
  itemsCrafted: "itemsCrafted",
};

// Proyección de los campos que enviamos al front.
const PROJECTION =
  "uuid playerName kills deaths kdr mobsKilled money blocksBroken blocksPlaced timePlayed distanceWalked itemsCrafted lastSeen";

// GET /api/rankings?category=kills&limit=50
// Devuelve el top de jugadores ordenado por la categoría solicitada.
const getRankings = async (req, res) => {
  try {
    const category = SORTABLE[req.query.category] ? req.query.category : "kills";
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);

    const players = await PlayerStats.find({}, PROJECTION)
      .sort({ [category]: -1 })
      .limit(limit)
      .lean();

    const ranked = players.map((p, i) => ({ ...p, rank: i + 1 }));

    res.status(200).json({
      success: true,
      category,
      count: ranked.length,
      players: ranked,
    });
  } catch (error) {
    console.error("Error al obtener rankings:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener rankings",
      error,
    });
  }
};

// GET /api/rankings/stats
// Totales globales del servidor para la cabecera del ranking.
const getGlobalStats = async (req, res) => {
  try {
    const [agg] = await PlayerStats.aggregate([
      {
        $group: {
          _id: null,
          totalPlayers: { $sum: 1 },
          totalKills: { $sum: "$kills" },
          totalMobsKilled: { $sum: "$mobsKilled" },
          totalBlocksBroken: { $sum: "$blocksBroken" },
          totalMoney: { $sum: "$money" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: agg || {
        totalPlayers: 0,
        totalKills: 0,
        totalMobsKilled: 0,
        totalBlocksBroken: 0,
        totalMoney: 0,
      },
    });
  } catch (error) {
    console.error("Error al obtener stats globales:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener stats globales",
      error,
    });
  }
};

module.exports = {
  getRankings,
  getGlobalStats,
};
