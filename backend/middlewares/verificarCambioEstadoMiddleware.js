// middlewares/verificarCambioEstadoMiddleware.js
const Usuario = require('@models/Usuario');
const verificarPermiso = require('@utils/verificarPermiso');

const verificarCambioEstadoMiddleware = async (req, res, next) => {
  try {
    const usuarioObjetivo = await Usuario.findById(req.params.id);
    if (!usuarioObjetivo) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    // Reutilizamos la lógica de jerarquía y validaciones
    const permiso = verificarPermiso({
      solicitante: req.usuario,
      objetivo: usuarioObjetivo,
      accion: 'cambiarEstado', // También puedes usar 'cambiarEstado' si defines esa acción
    });

    if (!permiso.permitido) {
      return res.status(403).json({ mensaje: permiso.mensaje });
    }

    // Si pasa todo, añadimos el usuario objetivo al request
    req.usuarioObjetivo = usuarioObjetivo;
    next();
  } catch (error) {
    console.error('Error al verificar cambio de estado:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

module.exports = verificarCambioEstadoMiddleware;
