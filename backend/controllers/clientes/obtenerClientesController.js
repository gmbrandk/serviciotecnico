const obtenerClientesService = require('@services/clientes/obtenerClientesService');
const { sendSuccess, sendError } = require('@utils/httpResponse');

const obtenerClientesController = async (req, res) => {
  try {
    const filtros = {
      nombre: req.query.nombre,
      estado: req.query.estado,
      calificacion: req.query.calificacion,
    };
    const clientes = await obtenerClientesService(filtros);
    return sendSuccess(res, 200, 'Clientes obtenidos correctamente', {
      clientes,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = obtenerClientesController;
