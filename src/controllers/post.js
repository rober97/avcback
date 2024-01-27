const Post = require('../models/postModel')
const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: 'dhvzfhn6b',
    api_key: '795736641819112',
    api_secret: 'opRwHWWI7wqztQDXAHiYprpeby4'
});

const uploadImage = async (req, res) => {
    try {
        // Validar los datos del cuerpo de la solicitud
        if (!req.file) {
            return res.json({
                message: "No se ha proporcionado ninguna imagen.",
                success: false
            });
        }

        // Subir imagen a Cloudinary
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({
                resource_type: 'auto'
            }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }).end(req.file.buffer);
        });

        // Si todo sale bien, se devuelve la URL de la imagen subida.
        return res.json({
            imageUrl: result.url,
            success: true
        });

    } catch (error) {
        console.error("Error al subir la imagen: ", error.message || error);
        return res.status(500).json({
            message: "Error interno del servidor.",
            success: false
        });
    }
}
const newPost = async (req, res) => {
    try {
        // Validar los datos del cuerpo de la solicitud
        const { userId, description, imageUrl } = req.body;

        if (!userId || !description) {
            return res.json({ message: "Faltan campos obligatorios.", success: false });
        }

        // Crear el nuevo post
        const post = new Post({
            user: userId,
            description,
            imageUrl,
            likes: [],
            comments: []
        });

        // Guardar el post en la base de datos
        const savedPost = await post.save();

        return res.json({ message: "Posteado correctamente.", post: savedPost, success: true });

    } catch (error) {
        console.error("Error al crear el post: ", error);
        return res.json({ message: "Error interno del servidor.", success: false });
    }
}
const updatePost = async (req, res) => {
    try {
        // Validar los datos del cuerpo de la solicitud
        const { _id, userId, description, imageUrl } = req.body; // Asumiendo que el objeto del post contiene un _id

        if (!_id || !userId || !description) {
            return res.json({ message: "Faltan campos obligatorios.", success: false });
        }

        // Buscar y actualizar el post
        const updatedPost = await Post.findOneAndUpdate(
            { _id }, // criterio de búsqueda
            {
                user: userId,
                description,
                imageUrl,
                // Nota: No estamos actualizando likes y comments aquí porque típicamente no los actualizarías de esta manera
            },
            { new: true } // Esto hace que el método devuelva el documento actualizado
        );

        if (!updatedPost) {
            return res.json({ message: "No se encontró el post para actualizar.", success: false });
        }

        return res.json({ message: "Post actualizado correctamente.", post: updatedPost, success: true });

    } catch (error) {
        console.error("Error al actualizar el post: ", error);
        return res.json({ message: "Error interno del servidor.", success: false });
    }
}
const listPost = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const size = parseInt(req.query.size) || 10;

        if (page <= 0 || size <= 0) {
            return res.json({ message: "Los parámetros page y size deben ser números positivos." });
        }
        const totalPosts = await Post.countDocuments();
        const skip = (page - 1) * size;

        // Poblar el campo user con la información completa del usuario que hizo la publicación
        // y también poblamos el campo user dentro de comments para obtener el nombre de quien comenta
        const posts = await Post.find()
            .skip(skip)
            .limit(size)
            .populate('user')
            .populate({
                path: 'comments.user',
                select: 'username'  // Si sólo quieres traer el nombre, puedes usar "select", sino omite esta línea para traer todo
            });

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
const updateLikes = async (req, res) => {
    try {
        const { postId, userId, action } = req.body;

        console.log('POSTTTT: ', postId)

        if (!postId || !userId || (action !== 'add' && action !== 'remove')) {
            return res.json({ message: "Datos inválidos.", success: false });
        }

        let updatedPost = null;

        if (action === 'add') {
            updatedPost = await Post.findByIdAndUpdate(
                postId,
                { $addToSet: { likes: userId } }, // $addToSet añade el userId al array si aún no está presente
                { new: true }
            );
        } else if (action === 'remove') {
            updatedPost = await Post.findByIdAndUpdate(
                postId,
                { $pull: { likes: userId } }, // $pull elimina el userId del array
                { new: true }
            );
        }

        if (!updatedPost) {
            return res.json({ message: "No se encontró el post para actualizar.", success: false });
        }

        return res.json({ message: `Like ${action === 'add' ? 'añadido' : 'eliminado'} correctamente.`, post: updatedPost, success: true });

    } catch (error) {
        console.error("Error al actualizar los likes del post: ", error);
        return res.json({ message: "Error interno del servidor.", success: false });
    }
}
const addComment = async (req, res) => {
    try {
        const { postId, comment } = req.body;
        console.log('BODYYYYYYYYYY: ', req.body)

        if (!postId || !comment || !comment.user || !comment.text) {
            return res.json({ message: "Datos inválidos.", success: false });
        }

        let newObject = {
            text: comment.text,
            createdAt: comment.createdAt,
            user: comment.user.id
        }

        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { $push: { comments: newObject } }, // $push añade el comentario al array de comentarios
            { new: true }
        );

        if (!updatedPost) {
            return res.json({ message: "No se encontró el post para añadir el comentario.", success: false });
        }

        return res.json({ message: "Comentario añadido correctamente.", post: updatedPost, success: true });

    } catch (error) {
        console.error("Error al añadir el comentario al post: ", error);
        return res.json({ message: "Error interno del servidor.", success: false });
    }
}

module.exports = {
    uploadImage,
    newPost,
    updatePost,
    listPost,
    updateLikes,
    addComment
};










module.exports = {
    newPost,
    listPost,
    uploadImage,
    updatePost,
    updateLikes,
    addComment
}