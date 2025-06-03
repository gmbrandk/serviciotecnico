const Movimiento = require('@models/Movimiento');

const crearMovimientoService = async ({
  tipo,
  descripcion,
  entidad,
  entidadId,
  usuarioId,
  usadoPor,
  session = null, // soporte para transacciones
}) => {
  const movimiento = new Movimiento({
    tipo,
    descripcion,
    entidad,
    entidadId,
    realizadoPor: usuarioId,
    usadoPor,
  });

  await movimiento.save({ session: session || undefined });
};

module.exports = crearMovimientoService;
