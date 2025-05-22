const Movimiento = require('@models/Movimiento');

const crearMovimiento = async ({ tipo, descripcion, entidad, entidadId, usuarioId }) => {
  console.log('Descripción recibida en crearMovimiento:', descripcion);  // <--- aquí
  console.log('📌 crearMovimiento() recibió usuarioId:', usuarioId);
  try {
    const movimiento = new Movimiento({
      tipo,
      descripcion,
      entidad,
      entidadId,
      realizadoPor: usuarioId,
    });
    await movimiento.save();
  } catch (error) {
    console.error('Error al registrar movimiento:', error.message);
  }
};

module.exports = crearMovimiento;
