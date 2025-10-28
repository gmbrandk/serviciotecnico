// controllers/tipoTrabajo/listarTipoTrabajoController.js
const listarTiposDeTrabajoService = require('@services/tipoTrabajo/listarTipoTrabajoService');
const TipoDeTrabajo = require('@models/TipodeTrabajo');
const { sendSuccess, sendError } = require('@utils/httpResponse');

const listarTiposDeTrabajoController = async (req, res) => {
  try {
    const { activo, tipo, unique } = req.query;

    // Si el usuario pide tipos únicos → devolvemos solo los valores distintos
    if (unique === 'true') {
      const tiposUnicos = await TipoDeTrabajo.distinct('tipo', {
        activo: true,
      });
      return sendSuccess(res, {
        status: 200,
        message: 'Tipos únicos obtenidos correctamente',
        details: tiposUnicos,
      });
    }

    // Caso normal → listado filtrado
    const filtros = {
      activo: activo !== undefined ? activo === 'true' : true,
      tipo: tipo || undefined,
    };

    const tiposDeTrabajo = await listarTiposDeTrabajoService(filtros);

    return sendSuccess(res, {
      status: 200,
      message: 'Tipos de trabajo obtenidos correctamente',
      details: tiposDeTrabajo,
    });
  } catch (err) {
    console.error('Error al listar tipos de trabajo:', err);
    return sendError(res, err);
  }
};

module.exports = listarTiposDeTrabajoController;
