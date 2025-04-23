const Usuario = require('../models/Usuario');

const editarUsuario = async (req, res) => {
  try {
    const { nombre, email, role } = req.body;
    if (!nombre && !email && !role) {
      return res.status(400).json({ mensaje: 'No se proporcionaron datos para actualizar.' });
    }

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      { nombre, email, role },
      { new: true }
    );

    res.status(200).json({
      mensaje: 'Usuario actualizado correctamente.',
      usuario: usuarioActualizado
    });
  } catch (error) {
    console.error('Error al editar usuario:', error);
    res.status(500).json({ mensaje: 'Error al editar usuario.' });
  }
};

module.exports = editarUsuario;
