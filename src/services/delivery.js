const Order = require('../models/order');
const minecraft = require('../controllers/minecraft');

const applyPlaceholders = (command, username) =>
  String(command)
    .replace(/\{player\}/g, username)
    .replace(/<player>/g, username)
    .replace(/^\//, ''); // quita el slash inicial si lo trae

// Entrega idempotente de una orden pagada.
// Reclama la orden de forma atómica (status 'paid' + delivered false) para evitar
// entregas duplicadas si el webhook llega más de una vez. Si el envío de comandos
// falla, revierte el flag para permitir un reintento posterior.
const deliverOrder = async (orderId) => {
  const order = await Order.findOneAndUpdate(
    { _id: orderId, status: 'paid', delivered: false },
    { $set: { delivered: true } },
    { new: true }
  ).populate('product');

  // Si no se reclamó: o no existe, o no está pagada, o ya fue entregada.
  if (!order) return null;

  const product = order.product;
  const username = order.minecraftUsername;

  try {
    if (!product || !username) {
      throw new Error('Faltan datos para la entrega (producto o usuario de Minecraft)');
    }

    for (const raw of (product.commands || [])) {
      const commands = String(raw).split(';').map((c) => c.trim()).filter(Boolean);
      for (const single of commands) {
        const finalCommand = applyPlaceholders(single, username);
        minecraft.sendCommand(finalCommand);
        console.log(`[entrega] Comando enviado: ${finalCommand}`);
      }
    }

    // Aviso en el chat del servidor (no crítico)
    try {
      minecraft.sendCommand(`broadcast ${username} ha adquirido: ${product.name}!`);
    } catch (e) {
      console.warn('[entrega] No se pudo enviar el broadcast:', e.message);
    }

    order.status = 'delivered';
    order.deliveredAt = new Date();
    await order.save();
    return order;
  } catch (error) {
    // Revertir el flag para que la orden pueda reintentarse
    order.delivered = false;
    await order.save();
    console.error(`[entrega] Falló la entrega de la orden ${orderId}:`, error.message);
    throw error;
  }
};

module.exports = { deliverOrder };
