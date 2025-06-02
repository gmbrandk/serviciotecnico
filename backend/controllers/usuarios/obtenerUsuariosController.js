const obtenerUsuariosService = require('@services/usuarios/obtenerUsuariosService');
const mongoose = require('mongoose');

const obtenerUsuarios = async (req, res) => {
  try {
    const filtros = {
      _id: req.query._id,
      role: req.query.role,
      activo: req.query.activo,
      nombre: req.query.nombre,
    };

    // Validar manualmente el _id si viene
    if (filtros._id && !mongoose.Types.ObjectId.isValid(filtros._id)) {
      return res.status(400).json({
        success: false,
        mensaje: 'El ID proporcionado no es válido.',
      });
    }

    const usuarios = await obtenerUsuariosService(filtros);

    res.status(200).json({ success: true, usuarios });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error interno del servidor.',
    });
  }
};

module.exports = obtenerUsuarios;
