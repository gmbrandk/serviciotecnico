// backend/middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');
const Usuario = require('@models/Usuario');

const verificarToken = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    console.log('Token no proporcionado');
    return res.status(401).json({ mensaje: 'Token no proporcionado.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id);
    if (!usuario) {
      console.log('Usuario no encontrado');
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    console.error('Error al verificar token:', error);
    res.status(401).json({ mensaje: 'Token inválido.' });
  }
};

const verificarRolesPermitidos = (rolesPermitidos) => {
  return (req, res, next) => {
    const rolUsuario = req.usuario?.role?.toLowerCase();
    const rolesPermitidosLower = rolesPermitidos.map(role => role.toLowerCase());

    if (!rolesPermitidosLower.includes(rolUsuario)) {
      console.log('Rol no permitido');
      return res.status(403).json({ mensaje: 'No tienes permisos para realizar esta acción.' });
    }

    next();
  };
};


module.exports = { verificarToken, verificarRolesPermitidos };
