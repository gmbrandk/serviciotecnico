const Usuario = require('../models/Usuario');
const verificarPermisoCambioRol = require('../utils/verificarPermisoCambioRol');

const verificarCambioRolMiddleware = async (req, res, next) => {
  const { id } = req.params;
  const { nuevoRol } = req.body;
  const solicitante = req.usuario;

  try {
    const usuarioObjetivo = await Usuario.findById(id);
    if (!usuarioObjetivo) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    const resultado = verificarPermisoCambioRol({
      solicitante,
      objetivo: usuarioObjetivo,
      nuevoRol
    });

    if (!resultado.permitido) {
      return res.status(403).json({ mensaje: resultado.mensaje });
    }

    // Guardamos el objetivo para que el controlador no lo vuelva a buscar
    req.usuarioObjetivo = usuarioObjetivo;

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en la verificación de permisos.' });
  }
};

module.exports = verificarCambioRolMiddleware;
