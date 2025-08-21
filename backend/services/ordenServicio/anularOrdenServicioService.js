const OrdenServicio = require('@models/OrdenServicio');
const Movimiento = require('@models/Movimiento');
const { ValidationError } = require('@utils/errors');
const TIPOS_MOVIMIENTO = require('@utils/constantes/tiposMovimiento');
const crearMovimiento = require('@controllers/movimiento/crearMovimientoController');

const anularORevertirOrdenServicioService = async (
  id,
  undo = false,
  usuarioId
) => {
  const orden = await OrdenServicio.findById(id);
  if (!orden) throw new ValidationError('Orden de servicio no encontrada.');

  // 🔄 Revertir anulación
  if (undo) {
    if (orden.estadoOS !== 'anulado') {
      throw new ValidationError(
        `La orden ${orden.codigo} no está anulada, no se puede revertir.`
      );
    }

    // Buscar último movimiento de anulación
    const ultimoMovimiento = await Movimiento.findOne({
      entidad: 'ordenServicio',
      entidadId: orden._id,
      tipo: TIPOS_MOVIMIENTO.EDITAR,
      'metadata.cambioPorAnulacion': true,
    }).sort({ fecha: -1 });

    if (!ultimoMovimiento) {
      throw new ValidationError(
        `No hay historial de anulación para la orden ${orden.codigo}.`
      );
    }

    const meta =
      ultimoMovimiento.metadata instanceof Map
        ? Object.fromEntries(ultimoMovimiento.metadata)
        : ultimoMovimiento.metadata;

    if (!meta?.estadoAnterior) {
      throw new ValidationError(
        `No hay estado previo guardado para la orden ${orden.codigo}.`
      );
    }

    const estadoOriginal = meta.estadoAnterior;

    orden.estadoOS = estadoOriginal;
    await orden.save();

    // Registrar movimiento de reversión
    await crearMovimiento({
      tipo: TIPOS_MOVIMIENTO.EDITAR,
      descripcion: `Se revirtió la anulación de la orden de servicio ${orden.codigo}`,
      entidad: 'ordenServicio',
      entidadId: orden._id,
      usuarioId,
      metadata: {
        nuevoEstado: estadoOriginal,
        fechaReversion: new Date(),
        reversionDe: ultimoMovimiento._id,
      },
    });

    return { orden, previousEstado: estadoOriginal };
  }

  // ❌ Anular normalmente
  if (orden.estadoOS === 'anulado') {
    throw new ValidationError(`La orden ${orden.codigo} ya está anulada.`);
  }

  const estadoAnterior = orden.estadoOS;
  orden.estadoOS = 'anulado';
  await orden.save();

  // Registrar movimiento de anulación
  await crearMovimiento({
    tipo: TIPOS_MOVIMIENTO.EDITAR,
    descripcion: `Se anuló la orden de servicio ${orden.codigo}`,
    entidad: 'ordenServicio',
    entidadId: orden._id,
    usuarioId,
    metadata: {
      estadoAnterior,
      fechaAnulacion: new Date(),
      cambioPorAnulacion: true,
    },
  });

  return { orden, previousEstado: estadoAnterior };
};

module.exports = anularORevertirOrdenServicioService;
