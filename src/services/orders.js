const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/userSocial');

// Error de checkout con código para que el front pueda reaccionar (ej. NOT_LINKED -> pedir vinculación).
class CheckoutError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}

// Crea una orden pendiente validando producto, usuario y vinculación de Minecraft.
// El precio SIEMPRE se toma de la base de datos, nunca del front.
const createPendingOrder = async ({ userId, productId, provider }) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new CheckoutError('Usuario no encontrado', 'USER_NOT_FOUND');
    }
    if (!user.minecraftUsername) {
        throw new CheckoutError('Debes vincular tu cuenta de Minecraft antes de comprar', 'NOT_LINKED');
    }

    const product = await Product.findById(productId);
    if (!product || !product.active) {
        throw new CheckoutError('Producto no disponible', 'PRODUCT_NOT_FOUND');
    }

    const currency = provider === 'mercadopago' ? 'CLP' : 'USD';
    const amount = provider === 'mercadopago' ? product.priceCLP : product.priceUSD;

    const order = await Order.create({
        user: user._id,
        minecraftUsername: user.minecraftUsername,
        product: product._id,
        productName: product.name,
        provider,
        amount,
        currency,
        status: 'pending',
    });

    return { order, product, user, amount, currency };
};

module.exports = { createPendingOrder, CheckoutError };
