// controllers/usuario/editarUsuario.js
const editarUsuarioService = require('@services/usuarios/EditarUsuarioService');

const editarUsuario = async (req, res) => {
  try {
    const usuarioActualizado = await editarUsuarioService({
      id: req.params.id,
      body: req.body,
      usuarioSolicitante: req.usuario,
    });

    const { password, ...usuarioSinPassword } = usuarioActualizado.toObject();

    res.status(200).json({
      success: true,
      mensaje: 'Usuario actualizado correctamente.',
      usuario: usuarioSinPassword,
    });
  } catch (error) {
    console.error('Error al editar usuario:', error);

    res.status(error.statusCode || 500).json({
      success: false,
      mensaje: error.mensaje || 'Error interno del servidor.',
      detalles: error.stack,
    });
  }
};

module.exports = editarUsuario;
