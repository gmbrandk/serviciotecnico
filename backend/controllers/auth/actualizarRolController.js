const actualizarRolUsuario = async (req, res) => {
    const usuarioObjetivo = req.usuarioObjetivo;
    const { nuevoRol } = req.body;
  
    try {
      usuarioObjetivo.role = nuevoRol.toLowerCase();
      await usuarioObjetivo.save();
  
      res.json({ mensaje: `Rol actualizado a ${nuevoRol.toLowerCase()} exitosamente.` });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: 'Error al actualizar el rol.' });
    }
  };
  
  module.exports = actualizarRolUsuario;
  