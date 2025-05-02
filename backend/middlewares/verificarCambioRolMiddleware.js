// ../middlewares/verificarCambioRolMiddleware.js
const Usuario = require('@models/Usuario');
const verificarPermiso = require('@utils/verificarPermiso');

const verificarCambioRolMiddleware = async (req, res, next) => {
  try {
    const usuarioObjetivo = await obtenerUsuarioPorId(req.params.id);
    if (!usuarioObjetivo) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    const permiso = verificarPermiso({
      solicitante: req.usuario,
      objetivo: usuarioObjetivo,
      accion: 'cambiarRol',
      nuevoRol: req.body.nuevoRol,
    });

    if (!permiso.permitido) {
      return res.status(403).json({ mensaje: permiso.mensaje });
    }

    req.usuarioObjetivo = usuarioObjetivo;
    next();
  } catch (error) {
    console.error('Error en verificación de cambio de rol:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

const obtenerUsuarioPorId = async (id) => {
  try {
    return await Usuario.findById(id);
  } catch {
    return null;
  }
};

module.exports = verificarCambioRolMiddleware;
