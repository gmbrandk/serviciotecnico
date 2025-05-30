const Usuario = require('@models/Usuario');
const { crearMovimiento } = require('@controllers/movimientoController');

const editarUsuario = async (req, res) => {
  if (!req.usuario || !req.usuario._id) {
    return res.status(401).json({
      success: false,
      mensaje: 'Usuario no autenticado',
    });
  }

  try {
    const { nombre, email } = req.body;

    // Validar que al menos uno de los campos permitidos esté presente
    if (!nombre && !email) {
      return res.status(400).json({
        success: false,
        mensaje: 'No se proporcionaron datos válidos para actualizar.',
        usuario: null,
      });
    }

    // Asegurar que sólo se actualicen campos permitidos
    const camposActualizados = {};
    if (nombre) camposActualizados.nombre = nombre;
    if (email) camposActualizados.email = email;

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      camposActualizados,
      { new: true, runValidators: true }
    );

    if (!usuarioActualizado) {
      return res.status(404).json({
        success: false,
        mensaje: 'Usuario no encontrado.',
        usuario: null,
      });
    }

    // ✅ REGISTRO DE MOVIMIENTO
    await crearMovimiento({
      tipo: 'editar',
      descripcion: `El usuario ${usuarioActualizado.nombre} fue editado por ${req.usuario.nombre} (${req.usuario.role}).`,
      entidad: 'Usuario',
      entidadId: usuarioActualizado._id,
      usuarioId: req.usuario._id,
    });

    res.status(200).json({
      success: true,
      mensaje: 'Usuario actualizado correctamente.',
      usuario: {
        _id: usuarioActualizado._id,
        nombre: usuarioActualizado.nombre,
        email: usuarioActualizado.email,
        role: usuarioActualizado.role, // Se devuelve el rol, pero no se permite editarlo desde aquí
      },
    });
  } catch (error) {
    console.error('Error al editar usuario:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al editar usuario.',
      detalles: error.message,
      usuario: null,
    });
  }
};

module.exports = editarUsuario;
