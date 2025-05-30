const cambiarPasswordService = require('@services/usuarios/cambiarPasswordService');

const cambiarPasswordController = async (req, res) => {
  try {
    const { passwordActual, nuevaPassword, confirmarPassword } = req.body;
    const usuarioObjetivo = req.usuarioObjetivo;
    const usuarioSolicitante = req.usuario;

    const resultado = await cambiarPasswordService({
      usuarioSolicitante,
      usuarioObjetivo,
      passwordActual,
      nuevaPassword,
      confirmarPassword,
    });

    if (!resultado.success) {
      return res
        .status(400)
        .json({ success: false, mensaje: resultado.mensaje });
    }

    res.status(200).json({
      success: true,
      mensaje: 'Contraseña actualizada correctamente.',
    });
  } catch (error) {
    console.error('Error al cambiar la contraseña:', error);
    res
      .status(500)
      .json({ success: false, mensaje: 'Error interno del servidor.' });
  }
};

module.exports = cambiarPasswordController;
