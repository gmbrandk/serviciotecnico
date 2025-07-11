// 📁 controllers/equipos/obtenerEquipoPorIdController.js

const obtenerEquipoPorIdService = require('@services/equipos/obtenerEquipoPorIdService');
const { sendSuccess, sendError } = require('@utils/httpResponse');

const obtenerEquipoPorIdController = async (req, res) => {
  try {
    const { id } = req.params;

    const equipo = await obtenerEquipoPorIdService(id);

    return sendSuccess(res, {
      message: 'Equipo obtenido correctamente',
      details: { equipo }, // ✅ este bloque estaba faltando
    });
  } catch (error) {
    console.error('[❌ Error obtenerEquipoPorIdController]', error);
    return sendError(res, {
      status: error.status || 500,
      message: error.message || 'Error al obtener equipo por ID',
    });
  }
};

module.exports = obtenerEquipoPorIdController;
