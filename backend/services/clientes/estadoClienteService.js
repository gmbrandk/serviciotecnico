// @services/clientes/estadoClienteService.js
const Cliente = require('@models/Cliente');
const OrdenServicio = require('@models/OrdenServicio');

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

  cliente.isActivo = false;
  cliente.estado = 'suspendido';
  cliente.calificacion = 'malo';
  await cliente.save();

  return { yaEstaSuspendido: false, cliente };
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

  cliente.isActivo = true;
  cliente.estado = 'activo';
  cliente.calificacion = 'bueno';
  await cliente.save();

  return { yaEstaActivo: false, cliente };
};

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
