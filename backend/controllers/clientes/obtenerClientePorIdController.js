const obtenerClientesService = require('@services/clientes/obtenerClientesService');
const { sendSuccess, sendError } = require('@utils/httpResponse');

const obtenerClientePorIdController = async (req, res) => {
  try {
    const cliente = await obtenerClientesService({ id: req.params.id });
    return sendSuccess(res, 200, 'Cliente encontrado', { cliente });
  } catch (error) {
    return sendError(
      res,
      error.status || 500,
      error.mensaje || 'Error al obtener cliente'
    );
  }
};

module.exports = obtenerClientePorIdController;
