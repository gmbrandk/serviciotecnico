const OrdenServicio = require('@models/OrdenServicio');
const { NotFoundError, ValidationError } = require('@utils/errors');

/**
 * Anula una orden de servicio sin eliminarla físicamente (soft delete).
 * @param {string} ordenId - ID de la orden a anular.
 * @returns {Promise<Object>} - Orden anulada.
 */
const anularOrdenServicioService = async (ordenId) => {
  if (!ordenId) {
    throw new ValidationError('El ID de la orden es obligatorio.');
  }

  const orden = await OrdenServicio.findById(ordenId);

  if (!orden) {
    throw new NotFoundError('No se encontró la orden de servicio.');
  }

  if (orden.estadoOS === 'anulado') {
    throw new ValidationError('La orden ya está anulada.');
  }

  orden.estadoOS = 'anulado';
  orden.fechaActualizacion = new Date();

  await orden.save();

  return orden;
};

module.exports = anularOrdenServicioService;
