const Usuario = require('@models/Usuario');
const { crearMovimiento } = require('@controllers/movimientoController');

const eliminarUsuario = async (req, res) => {
  try {
    const usuarioEliminado = await Usuario.findByIdAndDelete(req.params.id);

    if (!usuarioEliminado) {
      return res.status(404).json({
        success: false,
        mensaje: 'Usuario no encontrado.',
        usuario: null
      });
    }

    // Registrar el movimiento
    await crearMovimiento({
      tipo: 'eliminar',
      descripcion: `El usuario ${usuarioEliminado.nombre} fue eliminado`,
      entidad: 'Usuario',
      entidadId: usuarioEliminado._id,
      usuarioId: req.usuario._id, // Asegúrate que authMiddleware añade `req.usuario`
    });

    res.status(200).json({
      success: true,
      mensaje: 'Usuario eliminado correctamente.',
      usuario: {
        _id: usuarioEliminado._id,
        nombre: usuarioEliminado.nombre,
        email: usuarioEliminado.email,
        role: usuarioEliminado.role
      }
    });

  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al eliminar usuario.',
      detalles: error.message,
      usuario: null
    });
  }
};

module.exports = eliminarUsuario;
