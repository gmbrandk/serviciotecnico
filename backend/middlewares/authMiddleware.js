// backend/middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// ✅ Verifica el token y carga el usuario en req.usuario
const verificarToken = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id);

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido' });
  }
};

// ✅ Middleware para validar UN rol específico
const roleAuth = (role) => {
  return (req, res, next) => {
    if (!req.usuario || req.usuario.role !== role) {
      return res.status(403).json({ mensaje: 'Acceso restringido' });
    }
    next();
  };
};

// ✅ Middleware para validar si el usuario tiene uno de los roles permitidos
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

module.exports = { verificarToken, roleAuth, verificarRolesPermitidos };
