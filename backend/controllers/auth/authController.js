// controllers/authController.js
const {
  loginService,
  verificarSesionActiva,
} = require('@services/auth/authService');

const login = async (req, res) => {
  const { email, password } = req.body;
  const tokenExistente = req.cookies.token;

  if (tokenExistente) {
    const { activa } = verificarSesionActiva(tokenExistente);
    if (activa) {
      return res.status(400).json({
        success: false,
        mensaje: 'Ya hay una sesión activa.',
        usuario: null,
      });
    }
  }

  try {
    const { token, usuario } = await loginService(email, password);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      mensaje: 'Inicio de sesión exitoso',
      usuario,
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(error.status || 500).json({
      success: false,
      mensaje: error.mensaje || 'Error al iniciar sesión',
      usuario: null,
    });
  }
};

const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 0,
  });

  res.status(200).json({
    success: true,
    mensaje: 'Sesión cerrada con éxito',
    usuario: null,
  });
};

module.exports = {
  login,
  logout,
};
