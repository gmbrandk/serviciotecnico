const obtenerClientePorIdService = require('@services/clientes/obtenerClientePorIdService');
const { sendSuccess, sendError } = require('@utils/httpResponse');

const obtenerClientePorIdController = async (req, res) => {
  try {
    const cliente = await obtenerClientePorIdService(req.params.id);
    return sendSuccess(res, 200, 'Cliente obtenido correctamente', { cliente });
  } catch (error) {
    const status = error.message === 'Cliente no encontrado' ? 404 : 500;
    return sendError(res, status, error.message);
  }
};

module.exports = obtenerClientePorIdController;
