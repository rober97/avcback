const Item = require('../models/items');
const Market = require('../models/markets');
const listItems = async (req, res) => {
    try {
        const arrayItemsDB = await Item.find();
        return res.status(200).json(arrayItemsDB);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al listar los artículos' });
    }
};

const newItem = async (req, res) => {
    try {
        let data = req.body;
        if (data.cantidad > 0) {
            data.precioUnitario = data.precio / data.cantidad;
        } else {
            data.precioUnitario = 0; // O maneja esto de otra manera según tu lógica
        }

        const item = new Item(data);
        const savedItem = await item.save();
        return res.status(201).json(savedItem);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al agregar el artículo' });
    }
};


const deleteItem = async (req, res) => {
    try {
        const result = await Item.findByIdAndDelete(req.params.id);
        if (result) {
            res.status(200).json({ success: true });
        } else {
            res.status(404).json({ success: false, message: 'Artículo no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const searchItems = async (req, res) => {
    const { query, type } = req.query;

    try {
        let items;
        if (type === 'codigo') {
            items = await Item.find({ codigo: { $regex: query, $options: 'i' } });
        } else if (type === 'nombre') {
            items = await Item.find({ nombre: { $regex: query, $options: 'i' } });
        } else {
            return res.status(400).json({ message: 'Tipo de búsqueda no válido' });
        }
        return res.status(200).json(items);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al buscar los artículos' });
    }
};

const recommendItems = async (req, res) => {
    try {
        const items = await Item.find();
        const recommendations = {};

        items.forEach(item => {
            const key = item.nombre.toLowerCase(); // Normalize key to handle case differences
            item.precioUnitario = item.precio / item.cantidad; // Ensure precioUnitario is calculated
            if (!recommendations[key] || item.precioUnitario < recommendations[key].precioUnitario) {
                recommendations[key] = item;
            }
        });

        return res.status(200).json(Object.values(recommendations));
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al recomendar los artículos' });
    }
};

const listItemsByMarket = async (req, res) => {
    try {
        const { supermercado } = req.query;
        const items = await Item.find({ supermercado: supermercado });
        return res.status(200).json(items);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al listar los artículos por supermercado' });
    }
};

module.exports = {
    newItem,
    listItems,
    deleteItem,
    searchItems,
    recommendItems,
    listItemsByMarket
};
