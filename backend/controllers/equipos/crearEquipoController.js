const crearEquipoService = require('@services/equipos/crearEquipoService');
const { sendSuccess, sendError } = require('@utils/httpResponse');
const { ValidationError } = require('@utils/errors');

const crearEquipoController = async (req, res) => {
  try {
    const equipo = await crearEquipoService(req.body);
    return sendSuccess(res, 201, 'Equipo creado correctamente', equipo);
  } catch (error) {
    console.error('[crearEquipoController] Error:', error.message);

    const status = error instanceof ValidationError ? error.status : 500;
    return sendError(res, status, error.message);
  }
};

module.exports = crearEquipoController;
