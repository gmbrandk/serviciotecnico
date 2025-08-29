// 📁 controllers/equipos/obtenerEquiposController.js

const obtenerEquiposService = require('@services/equipos/obtenerEquiposService');
const { sendSuccess, sendError } = require('@utils/httpResponse');

const obtenerEquiposController = async (req, res) => {
  try {
    const { clienteId, estado, texto, marca, tipo, limite, pagina, sort } =
      req.query;

    // ✅ Normalización de valores
    const clienteIdFinal =
      clienteId && clienteId.trim() !== '' ? clienteId : null;

    const resultado = await obtenerEquiposService({
      filtros: {
        clienteId: clienteIdFinal,
        estado: estado || null,
        texto: texto || null,
        marca: marca || null,
        tipo: tipo || null,
      },
      opciones: {
        limit: limite ? Number(limite) : 20,
        page: pagina ? Number(pagina) : 1,
        sortBy: sort || 'createdAt',
        order: sort && sort.startsWith('-') ? 'desc' : 'asc',
      },
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
      code: error.code || 'UNKNOWN_ERROR',
      details: error.details || null,
    });
  }
};

module.exports = obtenerEquiposController;
