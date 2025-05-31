// middlewares/verificarAcceso.js
const Usuario = require('@models/Usuario');
const verificarPermiso = require('@utils/verificarPermiso');
const { httpResponse } = require('@utils/httpResponse');

const verificarAcceso = (config) => {
  return async (req, res, next) => {
    try {
      const {
        accion,
        requiereUsuarioObjetivo = false,
        obtenerIdObjetivo = () => req.params.id,
        obtenerNuevoRol = () => req.body.rol,
        rolesPermitidos = null,
      } = config;

      const solicitante = req.usuario;

      // Si hay una lista de roles permitidos global (como en GET /usuarios), validarla directamente
      if (
        rolesPermitidos &&
        !rolesPermitidos.includes(solicitante?.role?.toLowerCase())
      ) {
        return httpResponse(res, 403, {
          ok: false,
          mensaje: 'No tiene permisos para acceder a esta ruta.',
        });
      }

      // Si se requiere un objetivo (otro usuario), buscarlo
      let objetivo = null;
      if (requiereUsuarioObjetivo) {
        const id = obtenerIdObjetivo(req);
        objetivo = await Usuario.findById(id);
        if (!objetivo) {
          return httpResponse(res, 404, {
            ok: false,
            mensaje: 'Usuario objetivo no encontrado.',
          });
        }
      }

      const permiso = verificarPermiso({
        solicitante,
        objetivo,
        accion,
        nuevoRol: obtenerNuevoRol(req),
      });

      if (!permiso.permitido) {
        return httpResponse(res, 403, { ok: false, mensaje: permiso.mensaje });
      }

      if (objetivo) req.usuarioObjetivo = objetivo;

      next();
    } catch (error) {
      console.error('Error en verificación de acceso:', error);
      return httpResponse(res, 500, {
        ok: false,
        mensaje: 'Error interno del servidor.',
      });
    }
  };
};

module.exports = verificarAcceso;
