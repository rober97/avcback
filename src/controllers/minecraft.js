const net = require('net');

// Conexión TCP al plugin socketAvC del servidor de Minecraft.
// Es el canal por el que se entregan los productos (comandos de consola).
const MINECRAFT_HOST = process.env.MINECRAFT_HOST || '209.192.187.106';
const MINECRAFT_PORT = parseInt(process.env.MINECRAFT_PORT || '8029', 10);

let clientSocket = null;
let connected = false;
let reconnectTimeout = null;

const scheduleReconnect = () => {
  if (reconnectTimeout) return;
  reconnectTimeout = setTimeout(() => {
    reconnectTimeout = null;
    connect();
  }, 5000);
};

const connect = () => {
  clientSocket = new net.Socket();

  clientSocket.connect(MINECRAFT_PORT, MINECRAFT_HOST, () => {
    connected = true;
    console.log('\x1b[32m%s\x1b[0m', 'Conectado al servidor de Minecraft!');
  });

  clientSocket.on('data', (data) => {
    console.log('\x1b[36m%s\x1b[0m', 'Recibido de Minecraft: ' + data);
  });

  clientSocket.on('close', () => {
    connected = false;
    console.log('\x1b[31m%s\x1b[0m', 'Conexión con Minecraft cerrada, reintentando...');
    scheduleReconnect();
  });

  clientSocket.on('error', (err) => {
    connected = false;
    console.error('\x1b[31m%s\x1b[0m', 'Error en socket de Minecraft:', err.message);
    clientSocket.destroy(); // dispara 'close' -> reintento
  });
};

const isConnected = () => connected && !!clientSocket && clientSocket.writable;

// Envía un comando de consola al servidor. Lanza error si no hay conexión.
const sendCommand = (command) => {
  if (!isConnected()) {
    throw new Error('Socket de Minecraft no conectado');
  }
  clientSocket.write(command + '\n');
};

module.exports = { connect, sendCommand, isConnected };
