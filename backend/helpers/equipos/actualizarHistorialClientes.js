// 📁 helpers/equipos/actualizarHistorialClientes.js

/**
 * Actualiza el historial de propietarios de un equipo
 * - Cierra la última entrada (fechaFin) si aún está abierta
 * - Agrega una nueva entrada con el cliente actual
 *
 * @param {Array} historial - Historial actual de propietarios
 * @param {String|ObjectId} nuevoClienteId - ID del nuevo cliente
 * @param {Object} options - Opciones adicionales
 * @param {String|ObjectId|null} options.usuarioId - Usuario responsable del cambio
 * @returns {Array} - Historial actualizado
 */
const actualizarHistorialClientes = (
  historial = [],
  nuevoClienteId,
  { usuarioId = null } = {}
) => {
  const now = new Date();

  if (!Array.isArray(historial)) historial = [];

  // ✅ Cerrar última entrada si está abierta
  if (historial.length > 0) {
    const ultimaEntrada = historial[historial.length - 1];
    if (!ultimaEntrada.fechaFin) {
      ultimaEntrada.fechaFin = now;
    }
  }

  // ✅ Agregar nueva entrada
  historial.push({
    clienteId: nuevoClienteId,
    fechaAsignacion: now,
    fechaFin: null,
    origenCambio: 'edicion', // Diferente de 'auto' usado en crearEquipo
    usuarioResponsable: usuarioId,
  });

  return historial;
};

module.exports = actualizarHistorialClientes;
