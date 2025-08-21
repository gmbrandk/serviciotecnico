const crearTipoDeTrabajoService = require('@services/tipoTrabajo/crearTipoTrabajoService');
const { sendSuccess, sendError } = require('@utils/httpResponse');

const crearTipoDeTrabajoController = async (req, res) => {
  try {
    const tipoTrabajoCreado = await crearTipoDeTrabajoService(req.body);

    return sendSuccess(res, {
      status: 201,
      message: 'Tipo de trabajo creado correctamente',
      details: { tipoTrabajo: tipoTrabajoCreado },
    });
  } catch (err) {
    console.error('Error al crear tipo de trabajo:', err);
    return sendError(res, err);
  }
};

module.exports = crearTipoDeTrabajoController;
