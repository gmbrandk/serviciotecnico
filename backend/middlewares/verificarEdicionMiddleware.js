// middlewares/verificarEdicionMiddleware.js
const Usuario = require('../models/Usuario');
const verificarPermiso = require('../utils/verificarPermiso');

const verificarEdicionMiddleware = async (req, res, next) => {
  try {
    const usuarioObjetivo = await Usuario.findById(req.params.id);
    if (!usuarioObjetivo) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });

    const permiso = verificarPermiso({
      solicitante: req.usuario,
      objetivo: usuarioObjetivo,
      accion: 'editar'
    });

    if (!permiso.permitido) {
      return res.status(403).json({ mensaje: permiso.mensaje });
    }

    req.usuarioObjetivo = usuarioObjetivo;
    next();
  } catch (error) {
    console.error('Error en verificación de edición:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

module.exports = verificarEdicionMiddleware;
