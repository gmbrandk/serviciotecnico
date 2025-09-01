// 📁 controllers/equipos/obtenerEquiposController.js
const obtenerEquiposService = require('@services/equipos/obtenerEquiposService');
const { sendSuccess, sendError } = require('@utils/httpResponse');

const obtenerEquiposController = async (req, res) => {
  try {
    // Lista blanca de parámetros permitidos
    const allowedFilters = [
      'id',
      'clienteId',
      'estado',
      'texto',
      'marca',
      'tipo',
      'nroSerie',
      'imei',
      'pagina',
      'limite',
      'macAddress',
      'sortBy',
      'order',
    ];

    // Detectar parámetros no permitidos
    const queryKeys = Object.keys(req.query);
    const invalidFilters = queryKeys.filter(
      (key) => !allowedFilters.includes(key)
    );

    if (invalidFilters.length > 0) {
      return sendError(res, {
        status: 400,
        message: `Parámetros no permitidos: ${invalidFilters.join(', ')}`,
      });
    }

    // Extraer parámetros
    const {
      id,
      clienteId,
      estado,
      texto,
      marca,
      tipo,
      nroSerie,
      pagina,
      limite,
      sortBy,
      order,
      imei,
      macAddress,
    } = req.query;

    // Llamar al service
    const resultado = await obtenerEquiposService({
      id: id || null,
      filtros: {
        clienteId,
        estado,
        texto,
        marca,
        tipo,
        nroSerie,
        imei,
        macAddress,
      },
      opciones: {
        page: pagina ? Number(pagina) : 1,
        limit: limite ? Number(limite) : 20,
        sortBy: sortBy || 'createdAt',
        order: order || 'desc',
      },
    });

    return sendSuccess(res, {
      status: 200,
      message: id
        ? 'Equipo obtenido correctamente'
        : 'Equipos obtenidos correctamente',
      details: resultado,
    });
  } catch (error) {
    console.error('[❌ Error obtenerEquiposController]', error);
    return sendError(res, {
      status: error.status || 500,
      message: error.mensaje || 'Error al obtener equipos',
      details: error.details || null,
    });
  }
};

module.exports = obtenerEquiposController;
