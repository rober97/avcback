const Hint = require('../models/hints');
const User = require('../models/user');
const File = require('../models/files');
const fs = require('fs');
const { dirname, join } = require('path');

// Listar todos los hints activos
const listHints = async (req, res) => {
  try {
    const hints = await Hint.find({ estado: 'activo' }).populate('userId', 'nombre apellido');
    return res.status(200).json(hints);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al listar los hints.' });
  }
};

// Crear un nuevo hint
const addHint = async (req, res) => {
  try {
    const { frase, artista, cancion, imagen, categoria, userId } = req.body;

    if (!frase || !userId) {
      return res.status(400).json({ message: 'Frase y usuario son obligatorios.' });
    }

    const newHint = new Hint({
      frase,
      artista,
      cancion,
      imagen,
      categoria,
      userId,
    });

    await newHint.save();
    return res.status(201).json({ message: 'Hint creado exitosamente.', hint: newHint });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al crear el hint.' });
  }
};

// Actualizar un hint
const updateHint = async (req, res) => {
  try {
    const { id } = req.params;
    const { frase, artista, cancion, imagen, categoria } = req.body;

    const updatedHint = await Hint.findByIdAndUpdate(id, {
      frase,
      artista,
      cancion,
      imagen,
      categoria,
    }, { new: true });

    if (!updatedHint) {
      return res.status(404).json({ message: 'Hint no encontrado.' });
    }

    return res.status(200).json({ message: 'Hint actualizado.', hint: updatedHint });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al actualizar el hint.' });
  }
};

// Borrar (soft delete) un hint
const deleteHint = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedHint = await Hint.findByIdAndUpdate(id, { estado: 'borrado' }, { new: true });

    if (!deletedHint) {
      return res.status(404).json({ message: 'Hint no encontrado.' });
    }

    return res.status(200).json({ message: 'Hint eliminado correctamente.', hint: deletedHint });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al eliminar el hint.' });
  }
};

// Dar like a un hint
const likeHint = async (req, res) => {
  try {
    const { id } = req.params;

    const hint = await Hint.findById(id);
    if (!hint) {
      return res.status(404).json({ message: 'Hint no encontrado.' });
    }

    hint.reaccionLikes += 1;
    await hint.save();

    return res.status(200).json({ message: 'Like agregado.', hint });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al dar like al hint.' });
  }
};

// Dar superlike a un hint
const superlikeHint = async (req, res) => {
  try {
    const { id } = req.params;

    const hint = await Hint.findById(id);
    if (!hint) {
      return res.status(404).json({ message: 'Hint no encontrado.' });
    }

    hint.reaccionSuperLikes += 1;
    await hint.save();

    return res.status(200).json({ message: 'Superlike agregado.', hint });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al dar superlike al hint.' });
  }
};

module.exports = {
  listHints,
  addHint,
  updateHint,
  deleteHint,
  likeHint,
  superlikeHint,
};
