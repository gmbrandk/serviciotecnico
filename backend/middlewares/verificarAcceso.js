const Usuario = require('@models/Usuario');
const Cliente = require('@models/Cliente');
const verificarPermiso = require('@utils/verificarPermiso');
const { sendError } = require('@utils/httpResponse');
const { validarBooleano, esBooleano } = require('@utils/validadores');

const verificarAcceso = (config) => {
  return async (req, res, next) => {
    try {
      const {
        accion,
        requiereUsuarioObjetivo = false,
        requiereClienteObjetivo = false,
        obtenerIdObjetivo = () => req.params.id,
        obtenerIdCliente = () => {
          const bodyId = req?.body?.clienteActual;
          const paramId = req?.params?.clienteId;
          const queryId = req?.query?.clienteId;

          console.log('📦 verificarAcceso: req.body.clienteActual:', bodyId);
          console.log('📦 verificarAcceso: req.params.clienteId:', paramId);
          console.log('📦 verificarAcceso: req.query.clienteId:', queryId);

          return bodyId || paramId || queryId || null;
        },
        obtenerNuevoRol,
        rolesPermitidos = null,
      } = config;

      const solicitante = req.usuario;
      console.log('👤 Usuario solicitante:', {
        id: solicitante?._id?.toString(),
        role: solicitante?.role,
      });

      const rolesPermitidosNormalizados =
        rolesPermitidos?.map((r) => r.toLowerCase()) || [];

      // ✅ Validación del campo booleano "activo"
      if (req.body && 'activo' in req.body) {
        const val = req.body.activo;

        if (typeof val === 'string') {
          req.body.activo = val.toLowerCase() === 'true';
        }

        if (!esBooleano(req.body.activo)) {
          return sendError(res, 400, 'El campo "activo" debe ser booleano.');
        }

        try {
          validarBooleano(req.body.activo, 'activo');
        } catch (err) {
          return sendError(res, 400, err.message);
        }
      }

      // 🛡️ Validación de roles global
      if (
        rolesPermitidosNormalizados.length > 0 &&
        !rolesPermitidosNormalizados.includes(solicitante?.role?.toLowerCase())
      ) {
        console.warn('❌ Rol no autorizado:', solicitante?.role);
        return sendError(
          res,
          403,
          'No tienes permisos para acceder a esta ruta'
        );
      }

      // 👤 Buscar usuario objetivo
      let objetivo = null;
      if (requiereUsuarioObjetivo) {
        const id = obtenerIdObjetivo(req);
        console.log('🔍 Buscando usuario objetivo con ID:', id);
        objetivo = await Usuario.findById(id);
        if (!objetivo) {
          return sendError(res, 404, 'Usuario objetivo no encontrado.');
        }
      }

      // 👥 Buscar cliente objetivo
      let clienteObjetivo = null;
      if (requiereClienteObjetivo) {
        const clienteId = obtenerIdCliente(req);
        console.log('🔍 Buscando cliente objetivo con ID:', clienteId);

        if (!clienteId) {
          return sendError(
            res,
            400,
            'clienteActual es requerido para esta operación.'
          );
        }

        clienteObjetivo = await Cliente.findById(clienteId);
        if (!clienteObjetivo) {
          return sendError(res, 404, 'Cliente no encontrado.');
        }
      }

      // 🔐 Verificación de permisos
      let nuevoRol;
      try {
        nuevoRol = obtenerNuevoRol ? obtenerNuevoRol(req) : undefined;
      } catch (e) {
        nuevoRol = undefined;
      }

      const permiso = verificarPermiso({
        solicitante,
        objetivo,
        accion,
        nuevoRol,
        clienteObjetivo,
      });

      console.log('🔐 Resultado verificación permisos:', permiso);

      if (!permiso.permitido) {
        return sendError(res, 403, permiso.mensaje);
      }

      // ✅ Inyectar en el request
      if (objetivo) req.usuarioObjetivo = objetivo;
      if (clienteObjetivo) req.clienteObjetivo = clienteObjetivo;

      next();
    } catch (error) {
      console.error('❌ Error interno en verificarAcceso:', error);
      return sendError(res, 500, 'Error interno del servidor.');
    }
  };
};

module.exports = verificarAcceso;
