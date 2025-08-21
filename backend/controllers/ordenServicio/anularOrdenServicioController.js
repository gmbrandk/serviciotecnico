const anularORevertirOrdenServicioService = require('@services/ordenServicio/anularOrdenServicioService');
const { sendSuccess, sendError } = require('@utils/httpResponse');

const anularOrdenServicioController = async (req, res) => {
  try {
    const { id } = req.params;
    const undo = req.body?.undo === true || req.body?.undo === 'true';
    const usuarioId = req.usuario._id;

    const { orden, previousEstado } = await anularORevertirOrdenServicioService(
      id,
      undo,
      usuarioId
    );

    return sendSuccess(res, {
      status: 200,
      message: undo
        ? `Orden de servicio ${orden.codigo} revertida correctamente.`
        : `Orden de servicio ${orden.codigo} anulada correctamente.`,
      details: { orden, previousEstado },
    });
  } catch (error) {
    return sendError(res, {
      status: error.status || 400,
      message: error.message || 'Error al procesar la orden de servicio.',
      details: error,
    });
  }
};

module.exports = anularOrdenServicioController;
