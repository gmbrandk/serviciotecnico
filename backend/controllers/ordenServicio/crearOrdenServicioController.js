// controllers/ordenServicio/crearOrdenServicioController.js
const crearOrdenServicioService = require('@services/ordenServicio/crearOrdenServicioService');
const { sendSuccess, sendError } = require('@utils/httpResponse');

const crearOrdenServicioController = async (req, res) => {
  try {
    // 🔎 Log del body recibido
    console.log('[crearOrdenServicioController] Body recibido:', req.body);

    const ordenCreada = await crearOrdenServicioService(req.body);

    return sendSuccess(res, {
      status: 201,
      message: `Orden de servicio ${ordenCreada.codigo} creada correctamente`,
      details: { orden: ordenCreada },
    });
  } catch (err) {
    console.error('❌ Error al crear orden de servicio:', err);
    return sendError(res, err);
  }
};

module.exports = crearOrdenServicioController;
