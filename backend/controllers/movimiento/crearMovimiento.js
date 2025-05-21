const Movimiento = require('@models/Movimiento');

const crearMovimiento = async ({ tipo, descripcion, entidad, entidadId, usuarioId }) => {
  try {
    const movimiento = new Movimiento({
      tipo,
      descripcion,
      entidad,
      entidadId,
      realizadoPor: usuarioId,
    });
    console.log('Descripción recibida en crearMovimiento:', descripcion); // <--- Aquí
    await movimiento.save();
  } catch (error) {
    console.error('Error al registrar movimiento:', error.message);
  }
};

module.exports = crearMovimiento;
