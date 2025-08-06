const actualizarOrdenServicioService = require('@services/ordenServicio/actualizarOrdenServicioService');
const { sendSuccess, sendError } = require('@utils/httpResponse');

const actualizarOrdenServicioController = async (req, res) => {
  try {
    const { id } = req.params;

    const ordenActualizada = await actualizarOrdenServicioService(id, req.body);

    return sendSuccess(
      res,
      200,
      'Orden de servicio actualizada correctamente',
      {
        orden: ordenActualizada,
      }
    );
  } catch (err) {
    console.error('Error al actualizar orden de servicio:', err);
    return sendError(res, err);
  }
};

module.exports = actualizarOrdenServicioController;
