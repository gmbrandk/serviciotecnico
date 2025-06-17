// 📁 controllers/equipos/crearEquipoController.js

const crearEquipoService = require('../../services/equipos/crearEquipoService');

const crearEquipoController = async (req, res) => {
  try {
    const equipo = await crearEquipoService(req.body);

    return res.status(201).json({
      success: true,
      mensaje: 'Equipo creado correctamente',
      equipo,
    });
  } catch (error) {
    console.error('[crearEquipoController] Error:', error.message);

    return res.status(400).json({
      success: false,
      mensaje: error.message || 'Error al crear el equipo',
    });
  }
};

module.exports = crearEquipoController;
