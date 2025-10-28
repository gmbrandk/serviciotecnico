const auditarTiposDeTrabajoService = require('@services/tipoTrabajo/auditarTiposDeTrabajoService');
const { sendSuccess, sendError } = require('@utils/httpResponse');

const auditarTiposDeTrabajoController = async (req, res) => {
  try {
    const tiposDeTrabajo = await auditarTiposDeTrabajoService();

    return sendSuccess(res, {
      status: 200,
      message: 'Auditoría completa de tipos de trabajo',
      totalRegistros: tiposDeTrabajo.length,
      details: tiposDeTrabajo,
    });
  } catch (err) {
    console.error('Error durante auditoría de tipos de trabajo:', err);
    return sendError(res, err);
  }
};

module.exports = auditarTiposDeTrabajoController;
