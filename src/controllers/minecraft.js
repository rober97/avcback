const net = require('net');

const MINECRAFT_SERVER_HOST = '104.128.70.147';  // La dirección IP de tu servidor de Minecraft
const MINECRAFT_SERVER_PORT = 8029;  // Asegúrate de cambiar esto al puerto que esté escuchando tu plugin de Spigot

const clientSocket = new net.Socket();

clientSocket.connect(MINECRAFT_SERVER_PORT, MINECRAFT_SERVER_HOST, function () {
    console.log('Conectado al servidor de Minecraft!');
});

clientSocket.on('data', function (data) {
    console.log('Recibido: ' + data);
});

clientSocket.on('close', function () {
    console.log('Conexión cerrada');
});

module.exports = clientSocket;
