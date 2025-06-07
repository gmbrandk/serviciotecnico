const eliminarClienteService = require('@services/clientes/eliminarClienteService');
const { sendSuccess, sendError } = require('@utils/httpResponse');

const eliminarClienteController = async (req, res) => {
  try {
    const cliente = await eliminarClienteService(req.params.id);
    return sendSuccess(res, 200, 'Cliente eliminado correctamente', {
      cliente,
    });
  } catch (error) {
    const status = error.message === 'Cliente no encontrado' ? 404 : 400;
    return sendError(res, status, error.message);
  }
};

module.exports = eliminarClienteController;
