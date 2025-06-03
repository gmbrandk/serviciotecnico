// services/authService.js
const Usuario = require('@models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const verificarSesionActiva = (token) => {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return { activa: true, payload };
  } catch (err) {
    return { activa: false };
  }
};

const loginService = async (email, password) => {
  const usuario = await Usuario.findOne({ email });

  if (!usuario) {
    throw { status: 404, mensaje: 'Usuario no encontrado' };
  }

  if (!usuario.activo) {
    throw {
      status: 403,
      mensaje: 'Tu cuenta está desactivada. Contacta al administrador.',
    };
  }

  const esValida = await bcrypt.compare(password, usuario.password);
  if (!esValida) {
    throw { status: 401, mensaje: 'Contraseña incorrecta' };
  }

  const token = jwt.sign(
    { id: usuario._id, email: usuario.email, role: usuario.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return {
    token,
    usuario: {
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      role: usuario.role,
    },
  };
};

module.exports = {
  verificarSesionActiva,
  loginService,
};
