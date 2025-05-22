const crearMovimiento = require('@controllers/movimiento/crearMovimiento'); // asegúrate de importar correctamente

const actualizarRolUsuario = async (req, res) => {
  const usuarioObjetivo = req.usuarioObjetivo;
  const { nuevoRol } = req.body;

  try {
    const rolAnterior = usuarioObjetivo.role;
    usuarioObjetivo.role = nuevoRol.toLowerCase();
    await usuarioObjetivo.save();

    // 🔄 Registrar movimiento
    await crearMovimiento({
      tipo: 'cambio_rol',
      descripcion: `${req.usuario.nombre} (${req.usuario.role}) cambió el rol de ${usuarioObjetivo.nombre} de ${rolAnterior} a ${nuevoRol.toLowerCase()}.`,
      entidad: 'Usuario',
      entidadId: usuarioObjetivo._id,
      usuarioId: req.usuario._id,
      fecha: new Date()
    });

    res.json({ mensaje: `Rol actualizado a ${nuevoRol.toLowerCase()} exitosamente.` });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar el rol.' });
  }
};

module.exports = actualizarRolUsuario;
