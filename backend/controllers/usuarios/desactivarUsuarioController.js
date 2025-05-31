const Usuario = require('@models/Usuario'); // Ruta al modelo Usuario
const Movimiento = require('@models/Movimiento'); // Ruta al modelo Movimiento

// Función para desactivar usuario
const desactivarUsuario = async (req, res) => {
  const { id } = req.params; // Obtener el ID del usuario desde los parámetros de la URL

  try {
    const usuario = await Usuario.findById(id);

    if (!usuario) {
      return res
        .status(404)
        .json({ success: false, mensaje: 'Usuario no encontrado' });
    }

    // Marcar al usuario como inactivo
    usuario.activo = false;
    await usuario.save();

    // Registrar el movimiento en el historial (opcional)
    const movimiento = new Movimiento({
      tipo: 'eliminar', // Puedes usar 'eliminar' o un tipo específico de desactivación
      descripcion: `EL usuarios ${req.user._id} desactivó al usuario ${usuario.nombre}.`,
      entidad: 'Usuario',
      entidadId: id,
      realizadoPor: req.user._id, // Asumiendo que tienes un middleware de autenticación que asigna req.user
      fecha: new Date(),
    });

    await movimiento.save();

    res.json({ success: true, mensaje: 'Usuario desactivado correctamente' });
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    res
      .status(500)
      .json({ success: false, mensaje: 'Error al desactivar usuario' });
  }
};

module.exports = desactivarUsuario;
