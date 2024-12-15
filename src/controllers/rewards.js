const Reward = require("../models/rewards");
const fs = require("fs");
const path = require("path");
const User = require('../models/userSocial')
const minecraftSocket = require('../controllers/minecraft')
const mongoose = require('mongoose');

const createRewardsFromJson = async () => {
  try {
    const filePath = path.join(__dirname, "../controllers/achievements/rewards.json");
    const rewardsData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    // Parámetros ajustados
    const aventuraConfig = {
      basePoints: 1000, // Puntos base para aventuras
      increment: 1800,  // Incremento por índice
      exponent: 0.8,    // Exponente para escalado progresivo
      qualityMultiplier: 2.2, // Multiplicador para recompensas marcadas como "buen nivel"
    };

    const premiumConfig = {
      basePoints: 1000, // Puntos base para aventuras
      increment: 1500,  // Incremento por índice
      exponent: 0.7,    // Exponente para escalado progresivo
      qualityMultiplier: 2.1, // Multiplicador para recompensas marcadas como "buen nivel"
    };

    // Fórmulas de cálculo
    const calculatePoints = (basePoints, index, increment, exponent, qualityBoost, qualityMultiplier) => {
      let points = basePoints + (index ** exponent) * increment;
      if (qualityBoost) {
        points *= qualityMultiplier; // Incrementa los puntos si tiene "qualityBoost"
      }
      return Math.round(points);
    };

    // Procesar recompensas de Aventura
    for (let i = 0; i < rewardsData.aventura_rewards.length; i++) {
      const reward = rewardsData.aventura_rewards[i];
      reward.points_required = calculatePoints(
        aventuraConfig.basePoints,
        i,
        aventuraConfig.increment,
        aventuraConfig.exponent,
        reward.qualityBoost || false, // Detectar si tiene qualityBoost
        aventuraConfig.qualityMultiplier
      );

      const existingReward = await Reward.findOne({ name: reward.name });

      if (!existingReward) {
        const newReward = new Reward({
          name: reward.name,
          description: reward.description,
          long_description: reward.long_description,
          points_required: reward.points_required,
          command: reward.command,
          category: "aventura",
        });

        await newReward.save();
        console.log(`Recompensa de aventura creada: ${reward.name}`);
      } else {
        console.log(`La recompensa de aventura ya existe: ${reward.name}`);
      }
    }

    // Procesar recompensas de Premium
    for (let i = 0; i < rewardsData.premium_rewards.length; i++) {
      const reward = rewardsData.premium_rewards[i];
      reward.points_required = calculatePoints(
        premiumConfig.basePoints,
        i,
        premiumConfig.increment,
        premiumConfig.exponent,
        reward.qualityBoost || false, // Detectar si tiene qualityBoost
        premiumConfig.qualityMultiplier
      );

      const existingReward = await Reward.findOne({ name: reward.name });

      if (!existingReward) {
        const newReward = new Reward({
          name: reward.name,
          description: reward.description,
          long_description: reward.long_description,
          points_required: reward.points_required,
          command: reward.command,
          category: "premium",
        });

        await newReward.save();
        console.log(`Recompensa premium creada: ${reward.name}`);
      } else {
        console.log(`La recompensa premium ya existe: ${reward.name}`);
      }
    }

    console.log("TODO LISTO");
  } catch (error) {
    console.log("Error al crear las recompensas:", error);
  }
};




const getRewardsList = async (req, res) => {
  try {
    const { userId } = req.body; // Asegúrate de que el userId se envía en el cuerpo de la solicitud

    // Verificar si el userId es un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'ID de usuario no válido' });
    }

    // Buscar al usuario en la base de datos y cargar sus recompensas reclamadas
    const user = await User.findById(userId).populate('rewardsClaimed');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Obtener todas las recompensas de la base de datos
    const rewards = await Reward.find();

    // Dividir las recompensas en categorías de 'aventura' y 'premium'
    const aventura_rewards = rewards.filter(reward => reward.category === 'aventura');
    const premium_rewards = rewards.filter(reward => reward.category === 'premium');

    // Marcar las recompensas que ya han sido reclamadas
    const markedAventuraRewards = aventura_rewards.map(reward => ({
      ...reward.toObject(),
      claimed: user.rewardsClaimed.some(claimed => claimed.equals(reward._id))
    }));

    const markedPremiumRewards = premium_rewards.map(reward => ({
      ...reward.toObject(),
      claimed: user.rewardsClaimed.some(claimed => claimed.equals(reward._id))
    }));

    // Enviar la respuesta con las recompensas agrupadas y marcadas
    res.json({
      success: true,
      aventura_rewards: markedAventuraRewards,
      premium_rewards: markedPremiumRewards
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
        // Dividir los comandos por ';' si están concatenados
        const commands = cmd.split(';').map(c => c.trim()); // Elimina espacios en blanco innecesarios

        commands.forEach(singleCommand => {
          // Reemplazar {player} por el nombre de usuario de Minecraft
          const finalCommand = singleCommand
            .replace('{player}', minecraftUsername)
            .replace('<player>', minecraftUsername)
            .replaceAll('/', ''); // Si necesitas eliminar '/', asegúrate de que es correcto

          // Enviar el comando al servidor de Minecraft
          if (minecraftSocket && minecraftSocket.writable) {
            minecraftSocket.write(finalCommand + '\n'); // Asegúrate de que el comando termine con '\n' para enviar
            console.log(`Comando enviado: ${finalCommand}`);
          } else {
            console.log('No se pudo enviar el comando. El socket no está conectado.');
            return res.json({ success: false, message: 'Error en la conexión al servidor de Minecraft' });
          }
        });
      });

      // Enviar un comando de broadcast al final
      const broadcastCommand = `broadcast ${minecraftUsername} ha reclamado la recompensa: ${reward.name}!`;
      minecraftSocket.write(broadcastCommand + '\n');
      console.log(`Comando de broadcast enviado: ${broadcastCommand}`);

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
