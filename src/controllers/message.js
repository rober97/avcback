const Message = require('../models/messageModel')
const Chat = require('../models/chatModel')
const newMessage = async (req, res) => {
    try {
        // Extraer datos del cuerpo de la solicitud
        const { sender, recipient, content } = req.body;
        console.log('CONTENT: ', req.body)
        // Validación básica: Asegurarse de que todos los campos estén presentes
        if (!sender || !recipient || !content) {
            return res.json({ success: false, message: 'Todos los campos son obligatorios.' });
        }

        // Verificar si ya existe un chat entre estos dos usuarios
        let chat = await Chat.findOne({
            participants: { $all: [sender, recipient] }
        });

        // Si no existe un chat, crearemos uno
        if (!chat) {
            chat = new Chat({
                participants: [sender, recipient]
            });
            await chat.save();
        }

        console.log('CONTENT: ', content)

        // Crear un nuevo mensaje utilizando el modelo
        const newMessage = new Message({
            sender,
            recipient,
            content: content.text
        });

        // Guardar el mensaje en la base de datos
        await newMessage.save();

        // Actualizar el chat con el ID del último mensaje
        chat.lastMessage = newMessage._id;
        chat.updatedAt = Date.now();
        await chat.save();

        // Enviar una respuesta con el mensaje creado
        res.json({ success: true, message: 'Mensaje creado con éxito.', data: newMessage });

    } catch (error) {
        console.error('Error al crear el mensaje:', error);
        res.status(500).json({ success: false, message: 'Error del servidor.' });
    }
}


const getSentMessagesBetweenUsers = async (req, res) => {
    try {
        const currentUser = req.params.currentUser;
        const targetUser = req.params.targetUser;

        console.log('CURRENT USER: ', currentUser)
        console.log('TARGET: ', targetUser)

        // Verificar que se han proporcionado ambos ID
        if (!currentUser || !targetUser) {
            return res.json({ success: false, message: 'Ambos ID de usuario son obligatorios.' });
        }

        // Buscar todos los mensajes donde:
        // 1) El remitente es el "currentUser" y el receptor es el "targetUser"
        // 2) O el remitente es el "targetUser" y el receptor es el "currentUser"
        const messages = await Message.find({
            $or: [
                { sender: currentUser, recipient: targetUser },
                { sender: targetUser, recipient: currentUser }
            ]
        })
            .populate('recipient', 'username') // Si aún necesitas información adicional del receptor
            .sort('-createdAt'); // Esto ordenará los mensajes desde el más reciente al más antiguo.

        // Enviar una respuesta con los mensajes encontrados
        res.json({ success: true, data: messages });

    } catch (error) {
        console.error('Error al obtener los mensajes entre usuarios:', error);
        res.status(500).json({ success: false, message: 'Error del servidor.' });
    }
};





module.exports = {
    newMessage,
    getSentMessagesBetweenUsers

}