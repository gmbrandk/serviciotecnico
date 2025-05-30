const cambiarRolService = require('@services/usuarios/cambiarRolService');

const actualizarRolUsuario = async (req, res) => {
  try {
    const { nuevoRol, contrasenaConfirmacion } = req.body;

    const usuarioActualizado = await cambiarRolService({
      usuarioSolicitante: req.usuario,
      usuarioObjetivo: req.usuarioObjetivo, // inyectado por middleware
      nuevoRol,
      contrasenaConfirmacion,
    });

    // 💡 Eliminar password antes de responder
    const { password, ...usuarioSinPassword } = usuarioActualizado.toObject();

    res.status(200).json({
      success: true,
      mensaje: `Rol actualizado a '${nuevoRol.toLowerCase()}' exitosamente.`,
      usuario: usuarioSinPassword,
    });
  } catch (error) {
    console.error('❌ Error en actualizarRolUsuario:', error);

    res.status(error.statusCode || 500).json({
      success: false,
      mensaje: error.mensaje || 'Error interno del servidor.',
    });
  }
};

module.exports = actualizarRolUsuario;
