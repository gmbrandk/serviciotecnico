const Usuario = require('@models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  const { email, password } = req.body;
  const tokenExistente = req.cookies.token;

  if (tokenExistente) {
    try {
      jwt.verify(tokenExistente, process.env.JWT_SECRET);
      return res.status(400).json({
        success: false,
        mensaje: 'Ya hay una sesión activa.',
        usuario: null
      });
    } catch (_) {
      // Continúa con login si el token expiró o no es válido
    }
  }

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({
        success: false,
        mensaje: 'Usuario no encontrado',
        usuario: null
      });
    }

    if (!usuario.activo) {
      return res.status(403).json({
        success: false,
        mensaje: 'Tu cuenta está desactivada. Contacta al administrador.',
        usuario: null
      });
    }

    const esValida = await bcrypt.compare(password, usuario.password);
    if (!esValida) {
      return res.status(401).json({
        success: false,
        mensaje: 'Contraseña incorrecta',
        usuario: null
      });
    }

    const token = jwt.sign(
      { id: usuario._id, email: usuario.email, role: usuario.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      mensaje: 'Inicio de sesión exitoso',
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        role: usuario.role
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al iniciar sesión',
      detalles: error.message,
      usuario: null
    });
  }
};

const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 0
  });

  res.status(200).json({
    success: true,
    mensaje: 'Sesión cerrada con éxito',
    usuario: null
  });
};

module.exports = { login, logout };
