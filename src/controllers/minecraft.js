const net = require('net');

const MINECRAFT_SERVER_HOST = '209.192.187.106'; // La dirección IP de tu servidor de Minecraft
const MINECRAFT_SERVER_PORT = 8029; // El puerto que esté escuchando tu plugin de Spigot

let clientSocket = new net.Socket();

const connectToMinecraftServer = () => {
  clientSocket.connect(MINECRAFT_SERVER_PORT, MINECRAFT_SERVER_HOST, function () {
    console.log('\x1b[32m%s\x1b[0m', 'Conectado al servidor de Minecraft!');
  });

  clientSocket.on('data', function (data) {
    console.log('\x1b[36m%s\x1b[0m', 'Recibido: ' + data);
  });

  clientSocket.on('close', function () {
    console.log('\x1b[31m%s\x1b[0m', 'Conexión cerrada, intentando reconectar...');
    setTimeout(connectToMinecraftServer, 5000); // Intentar reconectar después de 5 segundos
  });

  clientSocket.on('error', function (err) {
    console.error('\x1b[31m%s\x1b[0m', 'Error en la conexión:', err.message);
    clientSocket.destroy(); // Destruir el socket en caso de error
    setTimeout(connectToMinecraftServer, 5000); // Intentar reconectar después de 5 segundos
  });
};

// Iniciar la conexión al servidor de Minecraft
connectToMinecraftServer();

module.exports = clientSocket;
