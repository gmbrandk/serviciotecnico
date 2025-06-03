const registerService = require('@services/auth/registerServices');

const register = async (req, res) => {
  const { nombre, email, password, role, accessCode, codigoAcceso, activo } =
    req.body;

  try {
    const usuarioCreado = await registerService({
      nombre,
      email,
      password,
      role,
      accessCode,
      codigoAcceso,
      activo,
    });

    res.status(201).json({
      success: true,
      mensaje: 'Usuario registrado con éxito',
      usuario: usuarioCreado,
    });
  } catch (error) {
    console.error('Error en registro:', error.message);

    res.status(500).json({
      success: false,
      mensaje: 'Error al registrar usuario',
      detalles: error.message,
      usuario: null,
    });
  }
};

module.exports = register;
