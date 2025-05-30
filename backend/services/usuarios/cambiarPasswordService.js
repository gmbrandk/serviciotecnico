const bcrypt = require('bcryptjs');
const { crearMovimiento } = require('@controllers/movimientoController');
const TIPOS_MOVIMIENTO = require('@utils/constantes/tiposMovimiento');

const cambiarPasswordService = async ({
  usuarioSolicitante,
  usuarioObjetivo,
  passwordActual,
  nuevaPassword,
  confirmarPassword,
}) => {
  if (!nuevaPassword || nuevaPassword !== confirmarPassword) {
    return {
      success: false,
      mensaje: 'La confirmación de la nueva contraseña no coincide.',
    };
  }

  const esCambioPropio = usuarioSolicitante._id.equals(usuarioObjetivo._id);
  if (esCambioPropio) {
    const coincide = await bcrypt.compare(
      passwordActual || '',
      usuarioObjetivo.password
    );
    if (!coincide) {
      return { success: false, mensaje: 'La contraseña actual es incorrecta.' };
    }
  }

  // ✅ Solo se asigna la nueva contraseña como texto plano
  usuarioObjetivo.password = nuevaPassword;
  await usuarioObjetivo.save(); // el hook pre('save') se encarga del hash

  await crearMovimiento({
    tipo: TIPOS_MOVIMIENTO.CAMBIO_PSSWD,
    descripcion: esCambioPropio
      ? `${usuarioSolicitante.nombre} actualizó su propia contraseña.`
      : `${usuarioSolicitante.nombre} (${usuarioSolicitante.role}) cambió la contraseña de ${usuarioObjetivo.nombre}.`,
    entidad: 'Usuario',
    entidadId: usuarioObjetivo._id,
    usuarioId: usuarioSolicitante._id,
  });

  return { success: true };
};

module.exports = cambiarPasswordService;
