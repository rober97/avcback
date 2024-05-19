const User = require('../models/userSocial')
const Post = require('../models/postModel')
const bcrypt = require("bcryptjs");
//const minecraftSocket = require('../controllers/minecraft')

const newUser = async (req, res) => {
    try {
        const data = req.body;
        console.log('LLEGO REGISTER: ', data);

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
            bio: '',
            imageUrl: ''
        });

        const savedUser = await user.save();
        return res.json({ message: "Usuario registrado correctamente.", user: savedUser, success: true });

    } catch (error) {
        console.error(error);
        return res.json({ message: "Error interno del servidor.", success: false });
    }
}


const followUser = async (req, res) => {
    const { userId, targetUserId } = req.body;

    try {
        // Asegurarse de que no se siga al mismo usuario dos veces
        const user = await User.findById(userId);
        if (user.following.indexOf(targetUserId) === -1) {
            await User.findByIdAndUpdate(userId, { $push: { following: targetUserId } });
            await User.findByIdAndUpdate(targetUserId, { $push: { followers: userId } });
            res.json({ message: "Ahora estás siguiendo al usuario.", success: true });
        } else {
            res.json({ message: "Ya sigues a este usuario.", success: false });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error interno del servidor.", success: false });
    }
};

const unfollowUser = async (req, res) => {
    const { userId, targetUserId } = req.body;

    try {
        // Asegurarse de que el usuario esté actualmente siguiendo al objetivo
        const user = await User.findById(userId);
        if (user.following.indexOf(targetUserId) > -1) {
            await User.findByIdAndUpdate(userId, { $pull: { following: targetUserId } });
            await User.findByIdAndUpdate(targetUserId, { $pull: { followers: userId } });
            res.json({ message: "Has dejado de seguir al usuario.", success: true });
        } else {
            res.json({ message: "No sigues a este usuario.", success: false });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error interno del servidor.", success: false });
    }
};




const loginUser = async (req, res) => {
    try {
        const data = req.body;
        console.log('LLEGO Login: ', data);

        const existingUser = await User.findOne({ username: data.username });
        console.log('USER:::', existingUser)
        if (existingUser && bcrypt.compareSync(data.password, existingUser.password)) {
            console.log('Enviando comando a Minecraft...');
            //minecraftSocket.write(`/bc HOLAAAAAAAAAAAAAAAAAAAAAA`);
            console.log('Comando enviado.');
            let objUser = {
                username: existingUser.username,
                id: existingUser._id,
                imageUrl: existingUser.imageUrl
            }
            return res.json({ message: "Login correcto.", success: true, user: objUser });
        }

        return res.json({ message: "Error en las credenciales.", success: false });

    } catch (error) {
        console.error(error);
        return res.json({ message: "Error interno del servidor." + error, success: false });
    }
}

const getUserById = async (req, res) => {
    try {
        let data = req.body;
        console.log('DATA: ', data)
        if (data.id) {
            const user_search = await User.findOne({
                _id: data.id
            })
            console.log('USER FOUND: ', user_search)
            res.json({ success: true, user: user_search })
        }
        else {
            res.json({ success: false, user: [] })
        }

    } catch (error) {
        console.log(error)
    }
}


const updateUser = async (req, res, namefile) => {
    try {
        let data = req.body;
        console.log('DATAAAAA: ', data)
        const user = await User.findOne({
            _id: data.id,
        })
        if (user) {
            console.log("BODY UPDATE: ", user)
            Object.assign(user, req.body)
            await user.save();
            res.json(
                {
                    success: true
                }
            )
        }
    } catch (error) {
        console.log(error)
    }
}

const listPostByUser = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const size = parseInt(req.query.size) || 10;
        const idUser = req.query.id;

        if (page <= 0 || size <= 0) {
            return res.json({ message: "Los parámetros page y size deben ser números positivos." });
        }

        // Aquí es donde agregamos la condición para filtrar por usuario
        const condition = {
            user: idUser
        };

        const totalPosts = await Post.countDocuments(condition);
        const skip = (page - 1) * size;

        // Poblar el campo user con la información completa del usuario que hizo la publicación
        const posts = await Post.find(condition)
            .skip(skip)
            .limit(size)
            .populate([
                { path: 'user' },
                { path: 'comments.user', select: 'username -_id' }
            ]);  // <-- Aquí usamos populate para traer la información del usuario

        const hasMore = skip + posts.length < totalPosts;

        return res.json({
            posts,
            hasMore,
            totalPages: Math.ceil(totalPosts / size),
            currentPage: page
        });

    } catch (error) {
        console.error(error);
        return res.json({ message: "Error interno del servidor." });
    }
}

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
        return res.status(400).json({ error: "'limit' must be a positive integer" });
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
        res.status(500).json({ error: 'Internal Server Error' });
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
    followUser
}