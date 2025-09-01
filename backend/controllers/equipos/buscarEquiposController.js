const buscarEquiposService = require('@services/equipos/buscarEquiposService');
const { sendSuccess, sendError } = require('@utils/httpResponse');
const { ValidationError } = require('@utils/errors');

module.exports = async (req, res) => {
  try {
    const {
      id,
      texto,
      marca,
      tipo,
      nroSerie,
      sku,
      imei,
      macAddress,
      mode,
      limit,
    } = req.query;

    const result = await buscarEquiposService({
      id: id || null,
      texto: texto || null,
      marca: marca || null,
      tipo: tipo || null,
      nroSerie: nroSerie || null,
      sku: sku || null,
      imei: imei || null,
      macAddress: macAddress || null,
      mode: mode || 'autocomplete',
      limit: limit ? Number(limit) : undefined,
    });

    return sendSuccess(res, {
      message: 'Equipos obtenidos correctamente',
      details: result,
    });
  } catch (error) {
    console.error('[❌ Error buscarEquiposController]', error);

    if (error instanceof ValidationError) {
      return sendError(res, {
        status: error.status || 400,
        message: error.message,
        code: error.code || 'VALIDATION_ERROR',
        details: error.details || null,
      });
    }

    return sendError(res, {
      status: 500,
      message: 'Error interno al buscar equipos',
      code: 'SERVER_ERROR',
      details: null,
    });
  }
};
