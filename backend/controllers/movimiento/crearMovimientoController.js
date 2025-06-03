const crearMovimientoService = require('@services/movimientos/crearMovimientoService');

const crearMovimientoController = async (datos, opciones = {}) => {
  const { tipo, descripcion, entidad, entidadId, usuarioId, usadoPor } = datos;

  const { session = null } = opciones;

  try {
    console.log('Descripción recibida en crearMovimiento:', descripcion);
    console.log('📌 crearMovimiento() recibió usuarioId:', usuarioId);

    await crearMovimientoService({
      tipo,
      descripcion,
      entidad,
      entidadId,
      usuarioId,
      usadoPor,
      session,
    });
  } catch (error) {
    console.error('Error al registrar movimiento:', error.message);
    // Si decides escalar el error, podrías lanzar una excepción aquí
    // throw error;
  }
};

module.exports = crearMovimientoController;
