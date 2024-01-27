const Chat = require('../models/chatModel')
const User = require('../models/userSocial');
const Message = require('../models/messageModel')

const getChatsByUser = async (req, res) => {
    try {
        // Extraer el ID del usuario desde los parámetros de la petición
        const userId = req.params.userId;
        console.log('CHATID: ', req.params.userId)

        if (!userId) {
            return res.json({ success: false, message: 'ID del usuario no proporcionado.' });
        }

        // Buscar los chats en los que el usuario es un participante
        const chats = await Chat.find({
            participants: { $in: [userId] }
        }).populate({
            path: 'lastMessage',
            populate: {
                path: 'sender',
                model: 'usersSocial'
            }
        }).sort({ updatedAt: -1 }); // Ordena los chats por la fecha de la última actualización

        // Para mejorar la respuesta, podrías querer agregar detalles adicionales, como la información del otro usuario en el chat
        const detailedChats = await Promise.all(chats.map(async (chat) => {
            const otherParticipantId = chat.participants.find(id => id.toString() !== userId.toString());
            const otherUser = await User.findById(otherParticipantId);

            // Buscar el último mensaje del chat
            const lastMessage = await Message.findOne({
                $or: [
                    { sender: userId, recipient: otherParticipantId },
                    { sender: otherParticipantId, recipient: userId }
                ]
            }).sort({ createdAt: -1 }); // Ordena por fecha de creación en orden descendente para obtener el último mensaje

            return {
                chatId: chat._id, // Podrías necesitar la ID del chat para abrirlo en el frontend
                otherUser: {
                    id: otherUser._id,
                    username: otherUser.username
                },
                lastMessage: lastMessage ? {
                    content: lastMessage.content,
                    createdAt: lastMessage.createdAt
                } : null // En caso de que no haya mensajes en el chat
            }
        }));

        res.json({ success: true, data: detailedChats });

    } catch (error) {
        console.error('Error al obtener los chats:', error);
        res.status(500).json({ success: false, message: 'Error del servidor.' });
    }
}

module.exports = {
    getChatsByUser
}

