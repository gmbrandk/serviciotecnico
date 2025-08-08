const anularOrdenServicioService = require('@services/ordenServicio/anularOrdenServicioService');
const { sendSuccess, sendError } = require('@utils/httpResponse');

const anularOrdenServicioController = async (req, res) => {
  try {
    const { id } = req.params;
    const ordenAnulada = await anularOrdenServicioService(id);
    sendSuccess(res, 'Orden de servicio anulada correctamente.', {
      orden: ordenAnulada,
    });
  } catch (error) {
    sendError(res, error);
  }
};

module.exports = anularOrdenServicioController;
