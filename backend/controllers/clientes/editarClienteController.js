const editarClienteService = require('@services/clientes/editarClienteService');
const { sendSuccess, sendError } = require('@utils/httpResponse');

const editarClienteController = async (req, res) => {
  try {
    const cliente = await editarClienteService(req.params.id, req.body);

    return sendSuccess(res, 200, 'Cliente editado correctamente', { cliente });
  } catch (error) {
    const status = error.message === 'Cliente no encontrado' ? 404 : 400;
    return sendError(res, status, error.message);
  }
};

module.exports = editarClienteController;
