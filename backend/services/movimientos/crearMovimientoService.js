const Movimiento = require('@models/Movimiento');

const crearMovimientoService = async ({
  tipo,
  descripcion,
  entidad,
  entidadId,
  usuarioId,
  usadoPor,
  session = null, // soporte para transacciones
  metadata,
}) => {
  const movimiento = new Movimiento({
    tipo,
    descripcion,
    entidad,
    entidadId,
    realizadoPor: usuarioId,
    usadoPor,
    metadata,
  });

  await movimiento.save({ session: session || undefined });
};

module.exports = crearMovimientoService;
