const Usuario = require('@models/Usuario');

const obtenerUsuario = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-password'); // Excluye la contraseña
    
    res.status(200).json({ usuarios });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

module.exports = obtenerUsuario;
