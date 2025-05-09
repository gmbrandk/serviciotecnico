// @utils/movimientos/obtenerCreadorPorEntidad.js
const Movimiento = require('@models/Movimiento');

const obtenerCreadorPorEntidad = async (entidad, entidadId, session = null) => {
  const movimientoCreacion = await Movimiento.findOne({
    tipo: 'crear',
    entidad,
    entidadId
  }).populate('realizadoPor').session(session || undefined);

  if (!movimientoCreacion || !movimientoCreacion.realizadoPor) {
    throw new Error(`No se encontró un creador para la entidad ${entidad} con ID ${entidadId}`);
  }

  return movimientoCreacion.realizadoPor;
};

module.exports = {obtenerCreadorPorEntidad};
