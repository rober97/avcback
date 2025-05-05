const Reaccion = require('../models/reaccion');

const reactHint = async (req, res) => {
  try {
    const { id: hintId } = req.params;
    const { tipo } = req.body;
    const userId = req.user?.id || req.body.userId; // depende si usas auth por token

    if (!userId || !tipo) {
      return res.status(400).json({ message: 'Faltan datos para reaccionar.' });
    }

    // Guarda la reacción o actualízala si ya existía
    const reaccion = await Reaccion.findOneAndUpdate(
      { userId, hintId },
      { tipo, fecha: new Date() },
      { upsert: true, new: true }
    );

    return res.status(200).json({ message: 'Reacción guardada', reaccion });
  } catch (err) {
    console.error('Error al reaccionar al hint:', err);
    return res.status(500).json({ message: 'Error interno al guardar la reacción' });
  }
};

module.exports = {
  reactHint
};
