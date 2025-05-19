const jwt = require('jsonwebtoken');
const Usuario = require('@models/Usuario');

const verificarToken = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    console.warn('[Middleware] ❌ No se encontró token en cookies');
    return res.status(401).json({ error: 'No autenticado' });
  }

  try {
    console.log('[Middleware] ✅ Token encontrado. Verificando...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[Middleware] 🔓 Token decodificado:', decoded);

    const usuario = await Usuario.findById(decoded.id);
    if (!usuario) {
      console.warn('[Middleware] ⚠️ Usuario no encontrado en la base de datos');
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    if (!usuario.activo) {
      console.warn('[Middleware] 🚫 Usuario inactivo');
      return res.status(403).json({ mensaje: 'Tu cuenta está desactivada. Contacta al administrador.' });
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
    res.status(401).json({ mensaje: 'Token inválido.' });
  }
};

const verificarRolesPermitidos = (rolesPermitidos) => {
  return (req, res, next) => {
    const rolUsuario = req.usuario?.role?.toLowerCase();
    const rolesPermitidosLower = rolesPermitidos.map(role => role.toLowerCase());

    if (!rolesPermitidosLower.includes(rolUsuario)) {
      return res.status(403).json({ mensaje: 'No tienes permisos para realizar esta acción.' });
    }

    next();
  };
};

module.exports = { verificarToken, verificarRolesPermitidos };
