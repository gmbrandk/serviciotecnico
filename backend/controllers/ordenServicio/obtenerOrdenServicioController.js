const obtenerOrdenServicioService = require('@services/ordenServicio/obtenerOrdenServicioService');
const { sendSuccess, sendError } = require('@utils/httpResponse');

const obtenerOrdenServicioController = async (req, res) => {
  try {
    const { id } = req.params;
    const filtro = req.query; // Si estás usando filtros en la búsqueda múltiple

    const resultado = await obtenerOrdenServicioService({
      id: id || null,
      filtro,
      paginacion: {
        limit: parseInt(req.query.limit) || 20,
        skip: parseInt(req.query.skip) || 0,
      },
    });

    return sendSuccess(res, 200, 'Orden(es) obtenida(s) correctamente', {
      ordenes: resultado,
    });
  } catch (err) {
    console.error('Error al obtener orden de servicio:', err);
    return sendError(res, err);
  }
};

module.exports = obtenerOrdenServicioController;
