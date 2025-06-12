const Cliente = require('@models/Cliente');
const OrdenServicio = require('@models/OrdenServicio');

const ESTADOS_INVALIDOS = ['baneado', 'suspendido'];
const CALIFICACIONES_NEGATIVAS = ['malo', 'muy_malo'];

// ✅ Suspender cliente temporalmente
const suspenderCliente = async (id) => {
  const cliente = await Cliente.findById(id);
  if (!cliente) throw new Error('Cliente no encontrado');

  // Si ya está inactivo o suspendido, evitar acción redundante
  if (cliente.estado === 'suspendido' && cliente.isActivo === false) {
    return { yaEstaSuspendido: true, cliente };
  }

  // Reglas de negocio
  const ordenActiva = await OrdenServicio.findOne({
    cliente: id,
    estadoOS: { $ne: 'finalizado' },
  });

  if (ordenActiva) {
    throw new Error('No puedes suspender un cliente con órdenes activas');
  }

  cliente.isActivo = false;
  cliente.estado = 'suspendido';
  cliente.calificacion = 'malo';
  await cliente.save();

  return { yaEstaSuspendido: false, cliente };
};

// ✅ Reactivar cliente
const reactivarCliente = async (id) => {
  const cliente = await Cliente.findById(id);
  if (!cliente) throw new Error('Cliente no encontrado');

  if (cliente.isActivo && cliente.estado === 'activo') {
    return { yaEstaActivo: true, cliente };
  }

  cliente.isActivo = true;
  cliente.estado = 'activo';
  cliente.calificacion = 'bueno'; // o la calificación previa si la almacenas
  await cliente.save();

  return { yaEstaActivo: false, cliente };
};

// ✅ Confirmar baja definitiva
const confirmarBajaCliente = async (id) => {
  const cliente = await Cliente.findById(id);
  if (!cliente) throw new Error('Cliente no encontrado');

  if (cliente.estado === 'baneado' && cliente.calificacion === 'muy_malo') {
    return { yaEstaBaneado: true, cliente };
  }

  cliente.isActivo = false;
  cliente.estado = 'baneado';
  cliente.calificacion = 'muy_malo';
  await cliente.save();

  return { yaEstaBaneado: false, cliente };
};

module.exports = {
  suspenderCliente,
  reactivarCliente,
  confirmarBajaCliente,
};
