const Usuario = require('../../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  const { email, password } = req.body;
  const tokenExistente = req.cookies.token;
  if (tokenExistente) {
    try {
      const decoded = jwt.verify(tokenExistente, process.env.JWT_SECRET);
      return res.status(400).json({ mensaje: 'Ya hay una sesión activa.' });
    } catch (error) {
      // Si el token es inválido o expiró, continúa con login normalmente
      console.warn('Token inválido al intentar verificar sesión existente:', error.message);
    }
  }
  
  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ success: false, mensaje: 'Usuario no encontrado' });
    }

    const esValida = await bcrypt.compare(password, usuario.password);
    if (!esValida) {
      return res.status(401).json({ success: false, mensaje: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: usuario._id, email: usuario.email, role: usuario.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Enviar token como cookie HTTP-only
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      sameSite: 'Lax',
      maxAge: 60 * 60 * 1000, // 1 hora
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
    console.error(error);
    res.status(500).json({ mensaje: 'Error al iniciar sesión' });
  }
};

// authController.js
const logout = (req, res) => {
  // Borra la cookie del token
  res.clearCookie('token', {
    httpOnly: true,  // Asegura que no sea accesible desde JavaScript en el cliente
    secure: process.env.NODE_ENV === 'production',  // Solo usa 'secure' en producción
    sameSite: 'Strict',  // O 'Lax' si se usa en distintas pestañas
    maxAge: 0  // La cookie ya no es válida
  });

  // Responde con un mensaje de éxito
  res.status(200).json({ mensaje: 'Sesión cerrada con éxito' });
};

module.exports = {login, logout};
