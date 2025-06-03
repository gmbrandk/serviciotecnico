const TIPOS_MOVIMIENTO = require('@utils/constantes/tiposMovimiento');
const crearMovimiento = require('@services/movimientos/crearMovimientoService');

const cambiarEstadoActivoService = async ({
  usuarioObjetivo,
  usuarioSolicitante,
  nuevoEstado,
}) => {
  if (usuarioObjetivo.activo === nuevoEstado) {
    return {
      yaEstaEnEseEstado: true,
      usuario: usuarioObjetivo,
    };
  }

  usuarioObjetivo.activo = nuevoEstado;
  await usuarioObjetivo.save();

  const tipoMovimiento = nuevoEstado
    ? TIPOS_MOVIMIENTO.REACTIVAR
    : TIPOS_MOVIMIENTO.DESACTIVAR;

  await crearMovimiento({
    tipo: tipoMovimiento,
    descripcion: `El usuario ${usuarioSolicitante.nombre} ${
      nuevoEstado ? 'reactivó' : 'desactivó'
    } al usuario ${usuarioObjetivo.nombre} correctamente.`,
    entidad: 'Usuario',
    entidadId: usuarioObjetivo._id,
    usuarioId: usuarioSolicitante._id,
    fecha: new Date(),
  });

  return {
    yaEstaEnEseEstado: false,
    usuario: usuarioObjetivo,
  };
};

module.exports = cambiarEstadoActivoService;
