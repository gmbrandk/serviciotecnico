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

  // 1️⃣ Validar que el nuevo rol no sea igual al actual
  if (nuevoRol === rolObjetivoActual) {
    throw {
      statusCode: 400,
      mensaje: 'El usuario ya tiene asignado ese rol.',
    };
  }

  // 2️⃣ Validar jerarquía
  if (rolesJerarquia[nuevoRol] > rolesJerarquia[rolSolicitante]) {
    throw {
      statusCode: 403,
      mensaje: 'No puedes asignar un rol igual o superior al tuyo.',
    };
  }

  // 3️⃣ Solo superadmin puede asignar ese rol, y debe confirmar con contraseña
  if (nuevoRol === 'superadministrador') {
    if (rolSolicitante !== 'superadministrador') {
      throw {
        statusCode: 403,
        mensaje: 'Solo un superadministrador puede asignar ese rol.',
      };
    }

    // 🔒 Verificar si la contraseña fue enviada
    if (!contrasenaConfirmacion || contrasenaConfirmacion.trim() === '') {
      throw {
        statusCode: 400,
        mensaje:
          'Debes ingresar tu contraseña para confirmar el cambio de rol.',
      };
    }

    // 🔐 Verificar si coincide la contraseña
    const coincide = await bcrypt.compare(
      contrasenaConfirmacion,
      usuarioSolicitante.password
    );

    if (!coincide) {
      throw {
        statusCode: 401,
        mensaje: 'La contraseña de confirmación es incorrecta.',
      };
    }
  }

  // 4️⃣ Actualizar y guardar
  const rolAnterior = usuarioObjetivo.role;
  usuarioObjetivo.role = nuevoRol.toLowerCase();
  await usuarioObjetivo.save();

  // 📝 Registrar movimiento
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
