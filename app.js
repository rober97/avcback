console.clear();
require("dotenv").config();
const express = require('express')
const player = require('./src/controllers/player.js');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const cors = require('cors')
const app = express();
const { Server } = require('socket.io');
const http = require('http');
const server = http.createServer(app);
//"https://avc-1dbca99a8369.herokuapp.com:9000"
const io = new Server(server, {
    cors: {
        origin: "https://avclatin.com",  // <- Solo permite solicitudes desde este dominio
        methods: ["GET", "POST"],        // Los métodos HTTP permitidos
        allowedHeaders: ["my-custom-header"], // Los headers permitidos
        credentials: true                // Solo si manejas autenticación o cookies
    }
});

io.on('connection', (socket) => {
    console.log('a user connected');
    // Unir al usuario a una sala específica
    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // Escuchar mensajes y reenviarlos a la misma sala
    socket.on('send_message', ({ roomId, message }) => {
        console.log("SE EMITE EVENTOOOOO PARA ENVIAR MENSAJEEEEEEEEE")
        message.sender = 'received'
        socket.to(roomId).emit('receive_message', message);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

// parse application/x-www-form-urlencoded
// parse application/json
const port = process.env.PORT || 3000;
app.use(cors()) //TODO EL MUNDO

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//Conexion a base de datos
console.log('PASS: ', process.env.PASSWORD)
console.log('USER: ', process.env.USER)
console.log('DBNAME: ', process.env.DBNAME)
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@clustershot.15wdu.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`
console.log(uri)
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Base de datos conectada'))
    .catch(e => console.log(e))

//Rutas
app.use('/', require('./src/routes/routes.js'));


//Control de errores
app.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_TYPES') {
        res.status(422).json({ error: 'Solo esta permitido subir archivos pdf' })
        return;
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(422).json({ error: 'El archivo es muy pesado' })
        return;
    }
})

//Middlewares
server.listen(port, () => {
    console.log('Servidor levantado en el puerto: ' + port)
})







