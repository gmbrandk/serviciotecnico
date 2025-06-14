const obtenerClientesService = require('@services/clientes/obtenerClientesService');
const { sendSuccess, sendError } = require('@utils/httpResponse');

const obtenerClientesController = async (req, res) => {
  try {
    const { estado, nombre, calificacion, page, limit, sortBy, order } =
      req.query;

    const filtros = {};
    if (estado) filtros.estado = estado;
    if (calificacion) filtros.calificacion = calificacion;
    if (nombre) filtros.nombre = new RegExp(nombre, 'i');

    const { clientes, total } = await obtenerClientesService({
      filtros,
      opciones: { page, limit, sortBy, order },
    });

    console.log('✅ Clientes obtenidos:', clientes);

    return sendSuccess(res, 200, 'Clientes obtenidos', { clientes, total });
  } catch (error) {
    return sendError(
      res,
      error.status || 500,
      error.mensaje || 'Error al obtener clientes'
    );
  }
};

module.exports = obtenerClientesController;
