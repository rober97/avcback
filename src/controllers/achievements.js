const SystemAchievement = require("../models/SystemAchievement");
const fs = require("fs");
const path = require("path");
const User = require('../models/userSocial')
const mongoose = require('mongoose');
const UserAchievement = require("../models/UserAchievement");


const createAchievementsFromJson = async () => {
  try {
    // Ruta al archivo JSON que contiene los logros
    const filePath = path.join(__dirname, "../controllers/achievements/achievement.json");

    // Leer el archivo JSON
    const achievementsData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    // Filtrar logros con nombres duplicados
    const uniqueAchievements = [];
    const namesSet = new Set();

    for (const achievement of achievementsData.achievements) {
      if (!namesSet.has(achievement.name)) {
        uniqueAchievements.push(achievement);
        namesSet.add(achievement.name);
      }
    }

    const newJSON = { achievements: uniqueAchievements }

    // Procesar cada logro único en `uniqueAchievements`
    for (const achievement of uniqueAchievements) {
      // Verificar si el logro ya existe en la base de datos (por clave única id)
      const existingAchievement = await SystemAchievement.findOne({ id: achievement.id });

      if (!existingAchievement) {
        // Crear el logro en la base de datos
        const newAchievement = new SystemAchievement({
          id: achievement.id,
          title: achievement.name,
          description: achievement.description,
          type: achievement.type,
          target: achievement.target,
          count: achievement.count
        });

        // Guardar el logro en la base de datos
        await newAchievement.save();
        console.log(`Logro creado: ${achievement.name}`);
      } else {
        console.log(`El logro ya existe: ${achievement.name}`);
      }
    }

    console.log('Todos los logros únicos fueron procesados.');
  } catch (error) {
    console.log("Error al crear los logros:", error);
  }
};

const getAchievementsList = async (req, res) => {
  try {
    // Obtener todos los logros del sistema sin preocuparse del usuario
    const allAchievements = await SystemAchievement.find();

    // Formatear los logros como objetos simples para el frontend
    const achievements = allAchievements.map(achievement => achievement.toObject());

    // Enviar la respuesta con todos los logros
    res.json({
      success: true,
      achievements
    });
  } catch (error) {
    console.error("Error al obtener los logros:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los logros"
    });
  }
};


module.exports = {
  createAchievementsFromJson,
  getAchievementsList,
};
