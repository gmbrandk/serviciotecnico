// middlewares/verificarAcceso.js
const Usuario = require('@models/Usuario');
const verificarPermiso = require('@utils/verificarPermiso');
const { httpResponse, sendError } = require('@utils/httpResponse');

const verificarAcceso = (config) => {
  return async (req, res, next) => {
    try {
      const {
        accion,
        requiereUsuarioObjetivo = false,
        obtenerIdObjetivo = () => req.params.id,
        obtenerNuevoRol,
        rolesPermitidos = null,
      } = config;

      const solicitante = req.usuario;
      const rolesPermitidosNormalizados =
        rolesPermitidos?.map((r) => r.toLowerCase()) || [];

      let nuevoRol;
      try {
        nuevoRol = obtenerNuevoRol ? obtenerNuevoRol(req) : undefined;
      } catch (e) {
        nuevoRol = undefined; // Falla segura
      }

      // Si hay una lista de roles permitidos global (como en GET /usuarios), validarla directamente
      console.log(
        '[🛡️ VerificarAcceso] Rol del solicitante:',
        solicitante?.role
      );
      console.log(
        '[🛡️ VerificarAcceso] Roles permitidos:',
        rolesPermitidosNormalizados
      );

      if (
        rolesPermitidosNormalizados.length > 0 &&
        !rolesPermitidosNormalizados.includes(solicitante?.role?.toLowerCase())
      ) {
        return sendError(
          res,
          403,
          'No tienes permisos para acceder a esta ruta'
        );
      }

      // Si se requiere un objetivo (otro usuario), buscarlo
      let objetivo = null;
      if (requiereUsuarioObjetivo) {
        const id = obtenerIdObjetivo(req);
        objetivo = await Usuario.findById(id);
        if (!objetivo) {
          return sendError(res, 404, 'Usuario objetivo no encontrado.');
        }
      }

      const permiso = verificarPermiso({
        solicitante,
        objetivo,
        accion,
        nuevoRol,
      });

      if (!permiso.permitido) {
        return sendError(res, 403, permiso.mensaje);
      }

      if (objetivo) req.usuarioObjetivo = objetivo;

      next();
    } catch (error) {
      console.error('Error en verificación de acceso:', error);
      return sendError(res, 500, 'Error interno del servidor.');
    }
  };
};

module.exports = verificarAcceso;
