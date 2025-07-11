// 📁 controllers/equipos/obtenerEquiposController.js

const obtenerEquiposService = require('@services/equipos/obtenerEquiposService');
const { sendSuccess, sendError } = require('@utils/httpResponse');

const obtenerEquiposController = async (req, res) => {
  try {
    const { clienteId, estado, texto, limite, pagina, sort } = req.query;

    const resultado = await obtenerEquiposService({
      clienteId,
      estado,
      texto,
      limite: Number(limite),
      pagina: Number(pagina),
      sort,
    });

    return sendSuccess(res, {
      message: 'Equipos obtenidos correctamente',
      details: resultado,
    });
  } catch (error) {
    console.error('[❌ Error obtenerEquiposController]', error);
    return sendError(res, {
      status: error.status || 500,
      message: error.message || 'Error al obtener equipos',
    });
  }
};

module.exports = obtenerEquiposController;
