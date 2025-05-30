const bcrypt = require('bcryptjs');
const TIPOS_MOVIMIENTO = require('@utils/constantes/tiposMovimiento');
const { crearMovimiento } = require('@controllers/movimientoController');
const rolesJerarquia = require('@utils/permisos/rolesJerarquia');

const cambiarRolService = async ({
  usuarioSolicitante,
  usuarioObjetivo,
  nuevoRol,
  contrasenaConfirmacion,
}) => {
  const rolSolicitante = usuarioSolicitante.role;
  const rolObjetivoActual = usuarioObjetivo.role;

  // Validar que el nuevo rol no sea igual al actual
  if (nuevoRol === rolObjetivoActual) {
    throw {
      statusCode: 400,
      mensaje: 'El usuario ya tiene asignado ese rol.',
    };
  }

  // Verificar jerarquía
  if (rolesJerarquia[nuevoRol] > rolesJerarquia[rolSolicitante]) {
    throw {
      statusCode: 403,
      mensaje: 'No puedes asignar un rol igual o superior al tuyo.',
    };
  }

  // Solo superadministrador puede asignar ese rol, y debe confirmar con su contraseña
  if (nuevoRol === 'superadministrador') {
    if (rolSolicitante !== 'superadministrador') {
      throw {
        statusCode: 403,
        mensaje: 'Solo un superadministrador puede asignar ese rol.',
      };
    }

    const coincide = await bcrypt.compare(
      contrasenaConfirmacion || '',
      usuarioSolicitante.password
    );

    if (!coincide) {
      throw {
        statusCode: 401,
        mensaje: 'La contraseña de confirmación es incorrecta.',
      };
    }
  }

  const rolAnterior = usuarioObjetivo.role;
  usuarioObjetivo.role = nuevoRol.toLowerCase();
  await usuarioObjetivo.save();

  // Registrar movimiento
  await crearMovimiento({
    tipo: TIPOS_MOVIMIENTO.CAMBIO_ROL,
    descripcion: `${usuarioSolicitante.nombre} (${
      usuarioSolicitante.role
    }) cambió el rol de ${
      usuarioObjetivo.nombre
    } de ${rolAnterior} a ${nuevoRol.toLowerCase()}.`,
    entidad: 'Usuario',
    entidadId: usuarioObjetivo._id,
    usuarioId: usuarioSolicitante._id,
  });

  return usuarioObjetivo;
};

module.exports = cambiarRolService;
