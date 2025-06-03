const cambiarEstadoActivoService = require('@services/usuarios/cambiarEstadoActivoService');

const cambiarEstadoActivoController = async (req, res) => {
  try {
    const usuario = req.usuarioObjetivo;
    const usuarioSolicitante = req.usuario;
    const { activo } = req.body;

    const resultado = await cambiarEstadoActivoService({
      usuarioObjetivo: usuario,
      usuarioSolicitante,
      nuevoEstado: activo,
    });

    if (resultado.yaEstaEnEseEstado) {
      return res.status(200).json({
        success: true,
        mensaje: `El usuario ya se encuentra ${
          activo ? 'activo' : 'inactivo'
        }.`,
      });
    }

    res.status(200).json({
      success: true,
      mensaje: `Usuario ${
        activo ? 'reactivado' : 'desactivado'
      } correctamente.`,
      usuario: {
        id: resultado.usuario._id,
        nombre: resultado.usuario.nombre,
        activo: resultado.usuario.activo,
      },
    });
  } catch (error) {
    console.error('Error al cambiar estado del usuario:', error);
    res.status(500).json({
      success: false,
      mensaje:
        error.message || 'Error del servidor al actualizar estado del usuario.',
    });
  }
};

module.exports = cambiarEstadoActivoController;
