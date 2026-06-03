const Product = require('../models/product');

// Catálogo público: productos activos para mostrar en la tienda.
const getProducts = async (req, res) => {
    try {
        const products = await Product.find({ active: true }).sort({ order: 1, createdAt: 1 });
        return res.json({ success: true, products });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        return res.status(500).json({ success: false, message: 'Error al obtener productos' });
    }
};

module.exports = { getProducts };
