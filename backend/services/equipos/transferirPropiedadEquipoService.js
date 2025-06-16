const Equipo = require('@models/Equipo');
const mongoose = require('mongoose');

const transferirPropiedadEquipoService = async ({
  equipoId,
  nuevoClienteId,
}) => {
  if (
    !mongoose.Types.ObjectId.isValid(equipoId) ||
    !mongoose.Types.ObjectId.isValid(nuevoClienteId)
  ) {
    throw new Error('ID inválido');
  }

  const equipo = await Equipo.findById(equipoId);
  if (!equipo) {
    throw new Error('Equipo no encontrado');
  }

  // No hacer nada si el nuevo propietario ya es el actual
  if (equipo.clienteActual.toString() === nuevoClienteId) {
    return equipo;
  }

  // Cerrar ciclo del propietario anterior
  const historial = equipo.historialPropietarios;
  const ultimoRegistro = historial[historial.length - 1];

  if (ultimoRegistro && !ultimoRegistro.fechaFin) {
    ultimoRegistro.fechaFin = new Date();
  }

  // Agregar nuevo propietario al historial
  equipo.historialPropietarios.push({
    clienteId: nuevoClienteId,
    fechaAsignacion: new Date(),
  });

  // Actualizar cliente actual
  equipo.clienteActual = nuevoClienteId;

  await equipo.save();
  return equipo;
};

module.exports = transferirPropiedadEquipoService;
