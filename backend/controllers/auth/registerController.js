const Usuario = require('../../models/Usuario');
const CodigoAcceso = require('../../models/CodigoAcceso');

const register = async (req, res) => {
  const { nombre, email, password, role, accessCode, codigoAcceso } = req.body;

  try {
    if (role === 'superadministrador' && accessCode !== process.env.SUPER_ADMIN_ACCESS_CODE) {
      return res.status(403).json({ mensaje: 'Código de acceso inválido para superAdministrador.' });
    }

    const codigoValido = await CodigoAcceso.findOne({ codigo: codigoAcceso });
    if (!codigoValido || codigoValido.usosDisponibles < 1) {
      return res.status(403).json({ mensaje: 'Código de acceso inválido o sin usos disponibles.' });
    }

    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'El correo ya está registrado.' });
    }

    const usuario = new Usuario({ nombre, email, password, role, accessCode: role === 'superadministrador' ? accessCode : undefined });
    await usuario.save();

    codigoValido.usosDisponibles -= 1;
    if (codigoValido.usosDisponibles <= 0) {
      await CodigoAcceso.deleteOne({ _id: codigoValido._id });
    } else {
      await codigoValido.save();
    }

    res.status(201).json({ success: true, mensaje: 'Usuario registrado con éxito', token: 'fake-jwt-token' }); // ← asegúrate de enviar el token real
  } catch (error) {
    console.error('Error en registro:', error);

    if (error.code === 11000 && error.keyValue?.email) {
      return res.status(400).json({ mensaje: 'El correo ya está registrado.' });
    }

    res.status(500).json({ mensaje: 'Error al registrar usuario' });
  }
};

module.exports = register;
