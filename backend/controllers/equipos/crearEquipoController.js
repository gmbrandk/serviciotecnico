const crearEquipoService = require('@services/equipos/crearEquipoService');
const { sendSuccess, sendError } = require('@utils/httpResponse');
const { ValidationError } = require('@utils/errors');

const crearEquipoController = async (req, res) => {
  try {
    const equipo = await crearEquipoService(req.body, req.usuario);
    return sendSuccess(res, 201, 'Equipo creado correctamente', equipo);
  } catch (error) {
    console.error('[crearEquipoController] Error:', error.message);

    const status = error.status || 500; // ✅ Esto cubre DuplicateError y ValidationError
    return sendError(res, {
      status,
      message: error.message,
      details: error.details || null,
    });
  }
};

module.exports = crearEquipoController;
