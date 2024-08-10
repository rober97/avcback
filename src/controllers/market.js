const Item = require("../models/items");
const Market = require("../models/markets");
const City = require("../models/cities");

const listItemsByMarket = async (req, res) => {
  try {
    const { supermercado } = req.query;
    const items = await Item.find({ supermercado: supermercado });
    return res.status(200).json(items);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al listar los artículos por supermercado" });
  }
};

const getMarketsByCity = async (req, res) => {
  try {
    const { cityId } = req.params;
    const markets = await Market.find({ ciudad: cityId }).populate('ciudad');
    return res.status(200).json(markets);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al listar los supermercados por ciudad" });
  }
};

const listAllMarkets = async (req, res) => {
  try {
    const markets = await Market.find().populate('ciudad');
    return res.status(200).json(markets);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al listar todos los supermercados" });
  }
};

const createMarket = async (req, res) => {
  try {
    const { nombre, direccion, telefono, ciudad } = req.body;
    const market = new Market({ nombre, direccion, telefono, ciudad });
    const savedMarket = await market.save();
    return res.status(201).json(savedMarket);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al crear el supermercado" });
  }
};

module.exports = {
  listItemsByMarket,
  getMarketsByCity,
  listAllMarkets,
  createMarket
};
