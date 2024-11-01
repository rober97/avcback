const User = require("../models/userSocial");
const Post = require("../models/postModel");
const bcrypt = require("bcryptjs");
const UserAchievement = require("../models/UserAchievement");
const SystemAchievement = require("../models/SystemAchievement");
const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");
//const minecraftSocket = require('../controllers/minecraft')

const { v4: uuidv4 } = require("uuid");
const { title } = require("process");

const generarTokenVinculacion = () => {
  return uuidv4(); // Genera un token UUID único
};

const guardarTokenEnUsuario = async (usuarioId, token) => {
  await User.findByIdAndUpdate(usuarioId, { tokenVinculacion: token });
};

const generarToken = async (req, res) => {
  const usuarioId = req.body.usuarioId; // ID del usuario
  const token = generarTokenVinculacion(usuarioId);
  await guardarTokenEnUsuario(usuarioId, token);
  res.json({ token });
};

const verifyToken = async (req, res) => {
  const token = req.body.token;

  // Encuentra al usuario con este token
  const user = await User.findOne({ tokenVinculacion: token });

  if (user) {
    // El token es válido, marca al usuario como vinculado y borra el token
    user.tokenVinculacion = null; // Elimina el token
    await user.save();
    res.json({ success: true, message: "Token válido, cuenta vinculada." });
  } else {
    res.status(400).json({ success: false, message: "Token inválido." });
  }
};

const newUser = async (req, res) => {
  try {
    const data = req.body;
    console.log("LLEGO REGISTER: ", data);

    const existingUser = await User.findOne({ username: data.username });

    if (existingUser) {
      return res.json({ message: "El usuario ya existe.", success: false });
    }

    const salt = bcrypt.genSaltSync(10); // Generar un salt
    const hashedPassword = bcrypt.hashSync(data.password, salt); // Hash la contraseña con el salt

    const user = new User({
      username: data.username,
      password: hashedPassword, // Usar la contraseña hasheada
      mail: data.mail,
      bio: "",
      imageUrl: "",
    });

    const savedUser = await user.save();
    return res.json({
      message: "Usuario registrado correctamente.",
      user: savedUser,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.json({ message: "Error interno del servidor.", success: false });
  }
};

const followUser = async (req, res) => {
  const { userId, targetUserId } = req.body;

  try {
    // Asegurarse de que no se siga al mismo usuario dos veces
    const user = await User.findById(userId);
    if (user.following.indexOf(targetUserId) === -1) {
      await User.findByIdAndUpdate(userId, {
        $push: { following: targetUserId },
      });
      await User.findByIdAndUpdate(targetUserId, {
        $push: { followers: userId },
      });
      res.json({ message: "Ahora estás siguiendo al usuario.", success: true });
    } else {
      res.json({ message: "Ya sigues a este usuario.", success: false });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error interno del servidor.", success: false });
  }
};

const unfollowUser = async (req, res) => {
  const { userId, targetUserId } = req.body;

  try {
    // Asegurarse de que el usuario esté actualmente siguiendo al objetivo
    const user = await User.findById(userId);
    if (user.following.indexOf(targetUserId) > -1) {
      await User.findByIdAndUpdate(userId, {
        $pull: { following: targetUserId },
      });
      await User.findByIdAndUpdate(targetUserId, {
        $pull: { followers: userId },
      });
      res.json({ message: "Has dejado de seguir al usuario.", success: true });
    } else {
      res.json({ message: "No sigues a este usuario.", success: false });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error interno del servidor.", success: false });
  }
};

const loginUser = async (req, res) => {
  try {
    const data = req.body;
    console.log("LLEGO Login: ", data);

    const existingUser = await User.findOne({ username: data.username });
    console.log("USER:::", existingUser);
    if (
      existingUser &&
      bcrypt.compareSync(data.password, existingUser.password)
    ) {
      console.log("Enviando comando a Minecraft...");
      //minecraftSocket.write(`/bc HOLAAAAAAAAAAAAAAAAAAAAAA`);
      console.log("Comando enviado.");
      let objUser = {
        username: existingUser.username,
        id: existingUser._id,
        imageUrl: existingUser.imageUrl,
        minecraftUUID: existingUser.minecraftUUID,
      };
      return res.json({
        message: "Login correcto.",
        success: true,
        user: objUser,
      });
    }

    return res.json({ message: "Error en las credenciales.", success: false });
  } catch (error) {
    console.error(error);
    return res.json({
      message: "Error interno del servidor." + error,
      success: false,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    let data = req.body;
    if (data.id) {
      const user_search = await User.findOne({
        _id: data.id,
      });
      res.json({ success: true, user: user_search });
    } else {
      res.json({ success: false, user: [] });
    }
  } catch (error) {
    console.log(error);
  }
};

const getUserByUUID = async (req, res) => {
  try {
    let data = req.body;
    if (data.uuid) {
      const user_search = await User.findOne({
        minecraftUUID: data.uuid,
      });
      res.json({ success: true, user: user_search });
    } else {
      res.json({ success: false, user: [] });
    }
  } catch (error) {
    console.log(error);
  }
};

const getUUIDUser = async (req, res) => {
  try {
    let data = req.body;
    if (data.id) {
      const user_search = await User.findOne({
        _id: data.id,
      });

      if (user_search.minecraftUUID) {
        res.json({ success: true, uuid: user_search.minecraftUUID });
      } else {
        res.json({ success: false, uuid: "" });
      }
    } else {
      res.json({ success: false, user: [] });
    }
  } catch (error) {
    console.log(error);
  }
};

const updateUser = async (req, res, namefile) => {
  try {
    let data = req.body;
    console.log("DATAAAAA: ", data);
    const user = await User.findOne({
      _id: data.id,
    });
    if (user) {
      console.log("BODY UPDATE: ", user);
      Object.assign(user, req.body);
      await user.save();
      res.json({
        success: true,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const listPostByUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const idUser = req.query.id;

    if (page <= 0 || size <= 0) {
      return res.json({
        message: "Los parámetros page y size deben ser números positivos.",
      });
    }

    // Aquí es donde agregamos la condición para filtrar por usuario
    const condition = {
      user: idUser,
    };

    const totalPosts = await Post.countDocuments(condition);
    const skip = (page - 1) * size;

    // Poblar el campo user con la información completa del usuario que hizo la publicación
    const posts = await Post.find(condition)
      .skip(skip)
      .limit(size)
      .populate([
        { path: "user" },
        { path: "comments.user", select: "username -_id" },
      ]); // <-- Aquí usamos populate para traer la información del usuario

    const hasMore = skip + posts.length < totalPosts;

    return res.json({
      posts,
      hasMore,
      totalPages: Math.ceil(totalPosts / size),
      currentPage: page,
    });
  } catch (error) {
    console.error(error);
    return res.json({ message: "Error interno del servidor." });
  }
};

const searchUsersPaginated = async (req, res) => {
  let { page, limit, query } = req.query;
  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  if (isNaN(page) || page <= 0) {
    return res.status(400).json({ error: "'page' must be a positive integer" });
  }

  if (isNaN(limit) || limit <= 0) {
    return res
      .status(400)
      .json({ error: "'limit' must be a positive integer" });
  }

  try {
    let searchCondition = {};
    if (query && query.trim() !== "") {
      searchCondition = { username: { $regex: query, $options: "i" } };
    }

    const users = await User.find(searchCondition)
      .limit(limit)
      .skip(limit * (page - 1))
      .exec();

    res.json(users);
  } catch (error) {
    // Manejar cualquier error que pueda ocurrir durante la búsqueda
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const getUsersPaginated = async (req, res) => {
  // Extraer parámetros de la consulta
  let { page, limit } = req.query;

  // Validar que page y limit son números enteros positivos
  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  if (isNaN(page) || page <= 0) {
    return res.status(400).json({ error: "'page' must be a positive integer" });
  }

  if (isNaN(limit) || limit <= 0) {
    return res
      .status(400)
      .json({ error: "'limit' must be a positive integer" });
  }

  try {
    // Obtener usuarios
    const users = await User.find()
      .limit(limit)
      .skip(limit * (page - 1))
      .exec();

    // Responder con los usuarios
    res.json(users);
  } catch (error) {
    // Manejar cualquier error que pueda ocurrir durante la obtención de usuarios
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const linkAccount = async (req, res) => {
  const { token, uuid, username, rank } = req.body;

  try {
    // Buscar al usuario por el token (deberías tener una forma de validar el token en tu sistema)
    const user = await User.findOne({ minecraftToken: token });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Token inválido o usuario no encontrado." });
    }

    // Actualizar el UUID de Minecraft y el nombre de usuario de Minecraft en la cuenta del usuario
    user.minecraftUUID = uuid;
    user.minecraftRank = rank || 'none';
    user.minecraftUsername = username; // Almacena el nombre de usuario de Minecraft
    user.minecraftToken = null; // Una vez usado el token, se puede limpiar
    await user.save();

    return res.status(200).json({ message: "Cuenta vinculada exitosamente." });
  } catch (error) {
    return res.status(500).json({ message: "Error al vincular la cuenta." });
  }
};

const storeMinecraftToken = async (req, res) => {
  const { username, token } = req.body;

  try {
    // Buscar al usuario por su nombre de usuario de Minecraft
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado." });
    }

    // Almacenar el token temporalmente en la cuenta del usuario
    user.minecraftToken = token;
    await user.save();

    return res.status(200).json({ message: "Token almacenado exitosamente." });
  } catch (error) {
    return res.status(500).json({ message: "Error al almacenar el token." });
  }
};

const generateToken = async (req, res) => {
  const { userId } = req.body;

  try {
    // Buscar al usuario por su ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // Verificar si la cuenta ya está vinculada a Minecraft
    if (user.minecraftUUID) {
      return res.status(200).json({
        message: "La cuenta ya está vinculada a Minecraft.",
        success: false,
        user: {
          username: user.username,
          mail: user.mail,
          minecraftUUID: user.minecraftUUID,
          minecraftUsername: user.minecraftUsername,
        },
      });
    }

    // Si la cuenta no está vinculada, generar un nuevo token
    const token = Math.random().toString(36).substring(2, 10); // Generar token aleatorio

    // Guardar el token en la cuenta del usuario
    user.minecraftToken = token;
    await user.save();

    return res.status(200).json({
      message: "Token generado exitosamente.",
      success: true,
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al generar el token." });
  }
};

const linkMinecraftAccount = async (req, res) => {
  const { token, uuid, rank } = req.body;

  try {
    // Buscar al usuario por el token
    const user = await User.findOne({ minecraftToken: token });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Token inválido o usuario no encontrado." });
    }

    // Vincular el UUID de Minecraft con la cuenta web del usuario
    user.minecraftUUID = uuid;
    user.minecraftRank = rank || 'none';
    user.minecraftToken = null; // Eliminar el token después de la vinculación
    await user.save();

    return res.status(200).json({ message: "Cuenta vinculada exitosamente." });
  } catch (error) {
    return res.status(500).json({ message: "Error al vincular la cuenta." });
  }
};

const getAchievementsByUser = async (req, res) => {
  const { uuid } = req.params;

  try {
    // Buscar los logros del jugador en la base de datos
    const playerAchievements = await UserAchievement.find({ uuid });

    // Buscar todos los logros del sistema
    const allAchievements = await SystemAchievement.find();

    // Vincular los logros del jugador con los logros del sistema
    const achievementsWithProgress = allAchievements.map(systemAchievement => {
      const userAchievement = playerAchievements.find(pa => pa.achievementKey === systemAchievement._id.toString());

      return {
        id: systemAchievement._id, // Usar '_id' generado por MongoDB
        name: systemAchievement.title,
        description: systemAchievement.description,
        progress: userAchievement ? userAchievement.progress : 0,
        count: systemAchievement.count,
        completed: userAchievement ? userAchievement.progress >= systemAchievement.count : false,
        title: systemAchievement.title,
        completionDate: userAchievement && userAchievement.completed ? userAchievement.completionDate : null, // Fecha de finalización si está completo
      };
    });

    return res.status(200).json({ success: true, playerAchievements: achievementsWithProgress });
  } catch (error) {
    console.log("Error al obtener los logros del usuario:", error);
    return res.status(500).json({ message: "Error al obtener los logros del usuario.", error });
  }
};


const getTopAchievements = async (req, res) => {
  try {
    // Agrupación y conteo de logros completados por usuario
    const topUsers = await UserAchievement.aggregate([
      { $match: { completed: true } },
      { $group: { _id: "$uuid", totalAchievements: { $sum: 1 } } },
      { $sort: { totalAchievements: -1 } },
      { $limit: 10 }
    ]);

    

    // Obtener datos adicionales de cada usuario con `uuid` correspondiente
    const enrichedUsers = await Promise.all(
      topUsers.map(async (user) => {
        const userData = await User.findOne({ minecraftUUID: user._id.trim() }, "username uuid"); // Ajusta según el modelo de usuario
        return userData
          ? {
              id: userData._id,
              username: userData.username,
              totalAchievements: user.totalAchievements,
            }
          : null; // Si no se encuentra el usuario, devuelve null
      })
    );

    // Filtrar usuarios no encontrados
    const validUsers = enrichedUsers.filter(user => user !== null);

    res.status(200).json({
      success: true,
      topUsers: validUsers,
    });
  } catch (error) {
    console.error("Error al obtener el top de usuarios:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener el top de usuarios",
      error,
    });
  }
};


module.exports = {
  newUser,
  loginUser,
  getUserById,
  updateUser,
  listPostByUser,
  getUsersPaginated,
  unfollowUser,
  followUser,
  linkAccount,
  generarToken,
  verifyToken,
  storeMinecraftToken,
  generateToken,
  linkMinecraftAccount,
  getAchievementsByUser,
  getTopAchievements,
  getUUIDUser,
  getUserByUUID,
  searchUsersPaginated
};
