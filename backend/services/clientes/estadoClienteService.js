const Cliente = require('@models/Cliente');
const OrdenServicio = require('@models/OrdenServicio');
const Movimiento = require('@models/Movimiento');

const suspenderCliente = async (id) => {
  const cliente = await Cliente.findById(id);
  if (!cliente) throw new Error('Cliente no encontrado');

  if (cliente.estado === 'baneado') {
    throw new Error('No se puede suspender un cliente que ya está baneado');
  }

  if (!cliente.isActivo && cliente.estado === 'suspendido') {
    return { yaEstaSuspendido: true, cliente };
  }

  const ordenActiva = await OrdenServicio.findOne({
    cliente: id,
    estadoOS: { $ne: 'finalizado' },
  });

  if (ordenActiva) {
    throw new Error('No puedes suspender un cliente con órdenes activas');
  }

  const estadoAnterior = cliente.estado;
  const calificacionAnterior = cliente.calificacion;

  cliente.isActivo = false;
  cliente.estado = 'suspendido';
  cliente.calificacion = 'malo';
  await cliente.save();

  console.log('[🟡 Suspensión] Cliente suspendido:', {
    id: cliente._id.toString(),
    estadoAnterior,
    calificacionAnterior,
    nuevoEstado: cliente.estado,
    nuevaCalificacion: cliente.calificacion,
  });

  return {
    yaEstaSuspendido: false,
    cliente,
    metadata: {
      estadoAnterior,
      calificacionAnterior,
      cambioPorSuspension: true,
    },
  };
};

const reactivarCliente = async (id) => {
  const cliente = await Cliente.findById(id);
  if (!cliente) throw new Error('Cliente no encontrado');

  if (cliente.estado === 'baneado') {
    throw new Error('No se puede reactivar un cliente que ha sido baneado');
  }

  if (cliente.isActivo && cliente.estado === 'activo') {
    return { yaEstaActivo: true, cliente };
  }

  const estadoAnterior = cliente.estado;
  const calificacionAnterior = cliente.calificacion;

  const movimientos = await Movimiento.find({
    entidad: 'cliente',
    entidadId: cliente._id,
    tipo: 'editar',
  }).sort({ fecha: -1 });

  console.log(
    `[📘 Reactivación] Se encontraron ${movimientos.length} movimientos de edición para cliente ${cliente._id}`
  );

  const ultimoMovimiento = movimientos.find((mov) => {
    const meta =
      mov.metadata instanceof Map
        ? Object.fromEntries(mov.metadata)
        : mov.metadata;
    return meta?.cambioPorSuspension;
  });

  let calificacionRestaurada = false;

  if (ultimoMovimiento) {
    const meta =
      ultimoMovimiento.metadata instanceof Map
        ? Object.fromEntries(ultimoMovimiento.metadata)
        : ultimoMovimiento.metadata;

    console.log(
      '[✅ Reactivación] Movimiento de suspensión encontrado con metadata:',
      {
        metadata: meta,
      }
    );

    if (meta?.calificacionAnterior) {
      cliente.calificacion = meta.calificacionAnterior;
      calificacionRestaurada = true;

      console.log('[🟢 Reactivación] Calificación restaurada desde metadata:', {
        calificacionAnterior,
        calificacionRestaurada: cliente.calificacion,
      });
    } else {
      console.warn(
        '[⚠️ Reactivación] Movimiento encontrado pero sin calificación anterior.'
      );
    }
  } else {
    console.warn(
      '[⚠️ Reactivación] No se encontró movimiento con cambioPorSuspension.'
    );
  }

  cliente.isActivo = true;
  cliente.estado = 'activo';
  await cliente.save();

  return {
    yaEstaActivo: false,
    cliente,
    metadata: {
      estadoAnterior,
      calificacionAnterior,
      restauracionDesdeMetadata: Boolean(ultimoMovimiento),
      calificacionRestaurada,
      sinCalificacionAnterior: !calificacionRestaurada,
      cambioPorReactivacion: true,
    },
  };
};

const confirmarBajaCliente = async (id) => {
  const cliente = await Cliente.findById(id);
  if (!cliente) throw new Error('Cliente no encontrado');

  if (cliente.estado === 'baneado' && cliente.calificacion === 'muy_malo') {
    return { yaEstaBaneado: true, cliente };
  }

  // 🚫 No permitir baja definitiva si no está suspendido
  if (cliente.estado !== 'suspendido') {
    throw new Error(
      'Para dar de baja definitiva a un cliente, este debe estar suspendido previamente'
    );
  }

  cliente.isActivo = false;
  cliente.estado = 'baneado';
  cliente.calificacion = 'muy_malo';
  await cliente.save();

  console.log('[🔴 Baja definitiva] Cliente baneado:', {
    id: cliente._id.toString(),
    estado: cliente.estado,
    calificacion: cliente.calificacion,
  });

  return { yaEstaBaneado: false, cliente };
};

module.exports = {
  suspenderCliente,
  reactivarCliente,
  confirmarBajaCliente,
};
