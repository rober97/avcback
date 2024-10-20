const Reward = require("../models/rewards");
const fs = require("fs");
const path = require("path");
const User = require('../models/userSocial')
const minecraftSocket = require('../controllers/minecraft')
const mongoose = require('mongoose');

const createRewardsFromJson = async () => {
  try {
    // Ruta al archivo JSON que contiene las recompensas
    const filePath = path.join(__dirname, "../controllers/achievements/rewards.json");

    // Leer el archivo JSON
    const rewardsData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    // Procesar las recompensas de Aventura
    for (const reward of rewardsData.aventura_rewards) {
      // Verificar si la recompensa ya existe en la base de datos (por nombre o id)
      const existingReward = await Reward.findOne({ name: reward.name });

      if (!existingReward) {
        // Crear la recompensa en la base de datos
        const newReward = new Reward({
          name: reward.name,
          description: reward.description,
          points_required: reward.points_required,
          command: reward.command,
          category: "aventura", // Agregar una categoría para diferenciar las recompensas
        });

        // Guardar la recompensa en la base de datos
        await newReward.save();
        console.log(`Recompensa de aventura creada: ${reward.name}`);
      } else {
        console.log(`La recompensa de aventura ya existe: ${reward.name}`);
      }
    }

    // Procesar las recompensas de Premium
    for (const reward of rewardsData.premium_rewards) {
      // Verificar si la recompensa ya existe en la base de datos (por nombre o id)
      const existingReward = await Reward.findOne({ name: reward.name });

      if (!existingReward) {
        // Crear la recompensa en la base de datos
        const newReward = new Reward({
          name: reward.name,
          description: reward.description,
          points_required: reward.points_required,
          command: reward.command,
          category: "premium", // Agregar una categoría para diferenciar las recompensas
        });

        // Guardar la recompensa en la base de datos
        await newReward.save();
        console.log(`Recompensa premium creada: ${reward.name}`);
      } else {
        console.log(`La recompensa premium ya existe: ${reward.name}`);
      }
    }
    console.log('TODO LISTO')
  } catch (error) {
    console.log("Error al crear las recompensas:", error);
  }
};

const getRewardsList = async (req, res) => {
  try {
    // Obtener todas las recompensas de la base de datos
    const rewards = await Reward.find();

    // Dividir las recompensas en categorías de 'aventura' y 'premium'
    const aventura_rewards = rewards.filter(reward => reward.category === 'aventura');
    const premium_rewards = rewards.filter(reward => reward.category === 'premium');

    // Enviar la respuesta con las recompensas agrupadas
    res.json({
      success: true,
      aventura_rewards,
      premium_rewards
    });
  } catch (error) {
    console.error("Error al obtener las recompensas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener las recompensas"
    });
  }
};


const claimReward = async (req, res) => {
  try {
    const { rewardId, userId } = req.body;

    // Verificar si el userId es un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.json({ success: false, message: 'ID de usuario no válido' });
    }

    // Convertir userId a ObjectId si es válido
    const objectId = mongoose.Types.ObjectId(userId);

    // Buscar al usuario en la base de datos
    const user = await User.findById(objectId);
    if (!user) {
      return res.json({ success: false, message: 'Usuario no encontrado' });
    }

    // Verificar si el usuario ya ha reclamado esta recompensa
    if (user.rewardsClaimed.includes(rewardId)) {
      return res.json({ success: false, message: 'Recompensa ya reclamada' });
    }

    // Buscar la recompensa en la base de datos
    const reward = await Reward.findById(rewardId);
    if (!reward) {
      return res.json({ success: false, message: 'Recompensa no encontrada' });
    }

    // Ejecutar los comandos en el servidor de Minecraft usando el socket
    const minecraftUsername = user.minecraftUsername; // Asegúrate de que este campo esté en el modelo de usuario

    if (minecraftUsername) {
      reward.command.forEach(cmd => {
        // Reemplazar {player} por el nombre de usuario de Minecraft
        const finalCommand = cmd.replace('{player}', minecraftUsername).replace('<player>', minecraftUsername);

        // Enviar el comando al servidor de Minecraft
        minecraftSocket.write(finalCommand + '\n'); // Asegúrate de que el comando termine con '\n' para enviar
        console.log(`Comando enviado: ${finalCommand}`);
      });
    } else {
      return res.json({ success: false, message: 'Nombre de usuario de Minecraft no vinculado' });
    }

    // Actualizar las recompensas reclamadas del usuario
    user.rewardsClaimed.push(rewardId);
    await user.save();

    // Retornar una respuesta exitosa
    res.json({ success: true, message: 'Recompensa reclamada con éxito' });
  } catch (error) {
    console.error("Error al reclamar la recompensa:", error);
    res.json({ success: false, message: 'Error al reclamar la recompensa' });
  }
};

module.exports = {
  createRewardsFromJson,
  getRewardsList,
  claimReward
};
