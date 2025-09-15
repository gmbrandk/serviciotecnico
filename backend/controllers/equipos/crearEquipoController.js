const crearEquipoService = require('@services/equipos/crearEquipoService');
const { sendSuccess, sendError } = require('@utils/httpResponse');
const { ValidationError } = require('@utils/errors');

const crearEquipoController = async (req, res) => {
  try {
    const equipo = await crearEquipoService(req.body, req.usuario);
    return sendSuccess(res, 201, 'Equipo creado correctamente', { equipo });
  } catch (error) {
    console.error('[crearEquipoController]', error);
    return sendError(
      res,
      error.status || 500,
      error.message || 'Error al crear el equipo'
    );
  }
};

module.exports = crearEquipoController;
