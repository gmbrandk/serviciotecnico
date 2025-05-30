const Usuario = require('@models/Usuario');
const { crearMovimiento } = require('@controllers/movimientoController');

const editarUsuarioService = async ({ id, body, usuarioSolicitante }) => {
  const CAMPOS_PERMITIDOS = ['nombre', 'email', 'telefono', 'direccion'];

  if ('role' in body) {
    throw {
      statusCode: 400,
      mensaje: 'No está permitido modificar el rol desde esta ruta.',
    };
  }

  const datosActualizables = {};
  for (const campo of CAMPOS_PERMITIDOS) {
    if (body[campo] !== undefined) {
      datosActualizables[campo] = body[campo];
    }
  }

  if (Object.keys(datosActualizables).length === 0) {
    throw {
      statusCode: 400,
      mensaje: 'No se proporcionaron campos válidos para actualizar.',
    };
  }

  const usuarioActualizado = await Usuario.findByIdAndUpdate(
    id,
    datosActualizables,
    { new: true, runValidators: true }
  );

  if (!usuarioActualizado) {
    throw {
      statusCode: 404,
      mensaje: 'Usuario no encontrado.',
    };
  }

  // Registrar movimiento aquí, dentro del servicio
  const esEdicionPropia = usuarioSolicitante._id.equals(usuarioActualizado._id);

  await crearMovimiento({
    tipo: 'editar',
    descripcion: esEdicionPropia
      ? `${usuarioSolicitante.nombre} actualizó su propia información.`
      : `${usuarioSolicitante.nombre} (${usuarioSolicitante.role}) editó al usuario ${usuarioActualizado.nombre}.`,
    entidad: 'Usuario',
    entidadId: usuarioActualizado._id,
    usuarioId: usuarioSolicitante._id,
  });

  return usuarioActualizado;
};

module.exports = editarUsuarioService;
