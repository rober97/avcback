const net = require('net');

const MINECRAFT_SERVER_HOST = '209.192.187.106'; // La dirección IP de tu servidor de Minecraft
const MINECRAFT_SERVER_PORT = 8029; // El puerto que esté escuchando tu plugin de Spigot

let clientSocket = new net.Socket();
let reconnectTimeout = null; // Para controlar los intentos de reconexión

const connectToMinecraftServer = () => {
  clientSocket.connect(MINECRAFT_SERVER_PORT, MINECRAFT_SERVER_HOST, () => {
    console.log('\x1b[32m%s\x1b[0m', 'Conectado al servidor de Minecraft!');
    
    // Limpiar el timeout si se reconecta con éxito
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
  });

  clientSocket.on('data', (data) => {
    console.log('\x1b[36m%s\x1b[0m', 'Recibido: ' + data);
  });

  clientSocket.on('close', () => {
    console.log('\x1b[31m%s\x1b[0m', 'Conexión cerrada, intentando reconectar...');
    // Evitar múltiples reconexiones en paralelo
    if (!reconnectTimeout) {
      reconnectTimeout = setTimeout(connectToMinecraftServer, 5000); // Intentar reconectar después de 5 segundos
    }
  });

  clientSocket.on('error', (err) => {
    console.error('\x1b[31m%s\x1b[0m', 'Error en la conexión:', err.message);
    clientSocket.destroy(); // Destruir el socket en caso de error
    if (!reconnectTimeout) {
      reconnectTimeout = setTimeout(connectToMinecraftServer, 5000); // Intentar reconectar después de 5 segundos
    }
  });
};

// Iniciar la conexión al servidor de Minecraft
connectToMinecraftServer();

module.exports = clientSocket;
