const City = require('../models/cities');

const listAllCities = async (req, res) => {
  try {
    const cities = await City.find();
    return res.status(200).json(cities);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al listar todas las ciudades' });
  }
};

const createCity = async (req, res) => {
  try {
    const { nombre, codigo, pais, estado, latitud, longitud, poblacion } = req.body;
    const city = new City({ nombre, codigo, pais, estado, latitud, longitud, poblacion });
    const savedCity = await city.save();
    return res.status(201).json(savedCity);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al crear la ciudad' });
  }
};

module.exports = {
  listAllCities,
  createCity
};
