const { sendSuccess, sendError } = require('@utils/httpResponse');
const { ValidationError } = require('@utils/errors');
const actualizarOrdenServicioService = require('@services/ordenServicio/actualizarOrdenServicioService');

const editarOrdenServicioController = async (req, res) => {
  try {
    const { id } = req.params;

    // Validación mínima
    if (!id) throw new ValidationError('Falta el ID de la orden de servicio.');

    // Pasar el body directamente al servicio
    const ordenEditada = await actualizarOrdenServicioService(id, req.body);

    return sendSuccess(res, {
      message: 'Orden de servicio editada correctamente.',
      details: ordenEditada,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

module.exports = editarOrdenServicioController;
