console.clear();
require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require("express-rate-limit");
const { Server } = require('socket.io');
const http = require('http');

// Controllers (opcional, si usas funciones globales aquí)
// const player = require('./src/controllers/player.js');
// const achievement = require('./src/controllers/achievements.js');
// const reward = require('./src/controllers/rewards.js');

// Express y HTTP server
const app = express();
const server = http.createServer(app);

// ------------------- CONFIGURACIÓN PROXY (HEROKU, ETC) -------------------
app.set('trust proxy', 1); // Permite leer IP real detrás de proxy (Heroku, etc)

// ------------------- RATE LIMIT -------------------
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 registros por IP cada 15 minutos
  message: "Demasiados registros desde esta IP, intenta más tarde"
});

// Aplica el rate limit a TODOS los endpoints de registro de usuario
app.use("/register", registerLimiter);
app.use("/new-user", registerLimiter);
// Si tienes otros endpoints, repite aquí
// app.use("/api/otro-endpoint-de-registro", registerLimiter);

// ------------------- CORS -------------------
app.use(cors()); // Permite solicitudes de cualquier origen (ajusta si necesitas seguridad extra)

// ------------------- BODY PARSER -------------------
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// ------------------- SOCKET.IO -------------------
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('connect', () => {
        console.log('Connected to Socket.IO server');
    });

    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on('send_message', ({ roomId, message }) => {
        message.sender = 'received';
        socket.to(roomId).emit('receive_message', message);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('account_linked', ({ token, uuid }) => {
        console.log(`Account linked for UUID: ${uuid} and Token: ${token}`);
        socket.emit("update_page", JSON.stringify({ token, uuid }));
    });
});

// ------------------- CONEXIÓN BASE DE DATOS -------------------
console.log('PASS: ', process.env.PASSWORD)
console.log('USER: ', process.env.USER)
console.log('DBNAME: ', process.env.DBNAME)
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@clustershot.15wdu.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`
console.log(uri)
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Base de datos conectada'))
    .catch(e => console.log(e))

// ------------------- RUTAS PRINCIPALES -------------------
app.use('/api', require('./src/routes/routes.js'));

// ------------------- CONTROL DE ERRORES MULTER/ARCHIVOS -------------------
app.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_TYPES') {
        res.status(422).json({ error: 'Solo está permitido subir archivos PDF' });
        return;
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(422).json({ error: 'El archivo es muy pesado' });
        return;
    }
});

// ------------------- INICIO DEL SERVIDOR -------------------
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log('Servidor levantado en el puerto: ' + port);
});

// ------------------- TAREAS PROGRAMADAS (si las necesitas) -------------------
// reward.createRewardsFromJson()
// achievement.createAchievementsFromJson()

// ------------------- RECAPTCHA (para integrar a futuro) -------------------
// Para máxima seguridad, agrega la verificación de reCAPTCHA aquí.
// Lo ideal es verificar el token del usuario en el backend antes de registrar.

