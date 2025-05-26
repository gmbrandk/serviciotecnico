// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const Usuario = require('@models/Usuario');
const { sendError } = require('@utils/httpResponse');

const verificarToken = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    console.warn('[Middleware] ❌ No se encontró token en cookies');
    return sendError(res, 401, 'Not authenticated');
  }

  try {
    console.log('[Middleware] ✅ Token encontrado. Verificando...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[Middleware] 🔓 Token decodificado:', decoded);

    const usuario = await Usuario.findById(decoded.id);
    if (!usuario) {
      console.warn('[Middleware] ⚠️ Usuario no encontrado en la base de datos');
      return sendError(res, 404, 'User not found');
    }

    if (!usuario.activo) {
      console.warn('[Middleware] 🚫 Usuario inactivo');
      return sendError(
        res,
        403,
        'Your account is deactivated. Contact the administrator.'
      );
    }

    console.log('[Middleware] 👤 Usuario autenticado:', {
      id: usuario._id.toString(),
      nombre: usuario.nombre,
      email: usuario.email,
      role: usuario.role,
    });

    req.usuario = usuario;
    next();
  } catch (error) {
    console.error('[Middleware] ❌ Error al verificar token:', error.message);
    return sendError(res, 401, 'Invalid token');
  }
};

const verificarRolesPermitidos = (rolesPermitidos) => {
  return (req, res, next) => {
    const rolUsuario = req.usuario?.role?.toLowerCase();
    const rolesPermitidosLower = rolesPermitidos.map((role) =>
      role.toLowerCase()
    );

    if (!rolesPermitidosLower.includes(rolUsuario)) {
      return sendError(
        res,
        403,
        'You do not have permission to perform this action.'
      );
    }

    next();
  };
};

module.exports = { verificarToken, verificarRolesPermitidos };
