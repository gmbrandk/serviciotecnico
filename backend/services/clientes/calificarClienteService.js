const Cliente = require('@models/Cliente');
const OrdenServicio = require('@models/OrdenServicio');
const { calcularCalificacionBase } = require('./calcularCalificacionCliente');

/**
 * 📦 Servicio que califica al cliente basado en reglas de negocio completas
 */
const calificarClienteService = async (clienteId) => {
  const cliente = await Cliente.findById(clienteId);
  if (!cliente) throw new Error('Cliente no encontrado');

  // 🛑 Regla 1: Cliente baneado se califica directamente
  if (cliente.estado === 'baneado') {
    cliente.calificacion = 'muy_malo';
    cliente.estado = 'suspendido';
    await cliente.save();
    return { cliente, mensaje: 'Cliente baneado calificado como muy malo' };
  }

  // 📦 Cargar órdenes finalizadas
  const ordenes = await OrdenServicio.find({
    cliente: cliente._id,
    estado: 'finalizado',
  });

  // 🧮 Paso 1: Calcular calificación base
  let calificacion = calcularCalificacionBase(ordenes);

  // 🧾 Paso 2: Ajustar por observaciones negativas
  const observacionesNegativas = ordenes.filter(
    (os) =>
      os.observaciones &&
      /problemático|agresivo|pago tardío|multa/i.test(os.observaciones)
  );

  if (observacionesNegativas.length >= 2) {
    calificacion = 'muy_malo';
  } else if (
    observacionesNegativas.length === 1 &&
    calificacion !== 'muy_malo'
  ) {
    calificacion = 'malo';
  }

  // 🎖️ Paso 3: Reglas VIP/frecuente
  if (
    cliente.observaciones &&
    /frecuente|vip|preferencial/i.test(cliente.observaciones) &&
    ['regular', 'malo'].includes(calificacion)
  ) {
    calificacion = 'bueno';
  }

  // ✅ Aplicar y guardar
  cliente.calificacion = calificacion;
  cliente.estado = calificacion === 'muy_malo' ? 'suspendido' : 'activo';

  await cliente.save();

  return { cliente, mensaje: 'Calificación actualizada correctamente' };
};

module.exports = calificarClienteService;
