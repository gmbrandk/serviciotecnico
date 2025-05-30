const obtenerUsuariosService = require('@services/usuarios/obtenerUsuariosService');

const obtenerUsuarios = async (req, res) => {
  try {
    const filtros = {
      role: req.query.role,
      activo: req.query.activo,
      nombre: req.query.nombre,
    };

    const usuarios = await obtenerUsuariosService(filtros);

    res.status(200).json({ usuarios });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

module.exports = obtenerUsuarios;
