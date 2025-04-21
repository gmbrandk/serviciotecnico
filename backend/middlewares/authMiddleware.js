const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Verifica el token y carga el usuario
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

// Middleware para validar rol
const roleAuth = (role) => {
  return (req, res, next) => {
    if (!req.usuario || req.usuario.role !== role) {
      return res.status(403).json({ mensaje: 'Acceso restringido' });
    }
    next();
  };
};

const verificarRolesPermitidos = (rolesPermitidos) => {
  return (req, res, next) => {
    const rolUsuario = req.usuario?.role?.toLowerCase(); // Convertir a minúsculas
    const rolesPermitidosLower = rolesPermitidos.map(role => role.toLowerCase());

    if (!rolesPermitidosLower.includes(rolUsuario)) {
      return res.status(403).json({ mensaje: 'No tienes permisos para realizar esta acción.' });
    }

    next();
  };
};

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'Token no proporcionado.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id);

    if (!usuario) return res.status(401).json({ mensaje: 'Usuario no válido.' });

    req.usuario = usuario;
    next();

  } catch (error) {
    console.error(error);
    res.status(401).json({ mensaje: 'Token inválido.' });
  }
};

module.exports = { verificarToken, roleAuth, verificarRolesPermitidos, authMiddleware };
