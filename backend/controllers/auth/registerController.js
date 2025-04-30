const mongoose = require('mongoose');
const Usuario = require('../../models/Usuario');
const CodigoAcceso = require('../../models/CodigoAcceso');

const register = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const { nombre, email, password, role, accessCode, codigoAcceso } = req.body;

  try {
    if (role === 'superadministrador' && accessCode !== process.env.SUPER_ADMIN_ACCESS_CODE) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ mensaje: 'Código de acceso inválido para superAdministrador.' });
    }

    const codigoValido = await CodigoAcceso.findOne({ codigo: codigoAcceso }).session(session);
    if (!codigoValido || codigoValido.usosDisponibles < 1) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ mensaje: 'Código de acceso inválido o sin usos disponibles.' });
    }

    const emailExistente = await Usuario.findOne({ email }).session(session);
    if (emailExistente) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ mensaje: 'El correo ya está registrado.' });
    }

    const usuarioExistente = await Usuario.findOne({ nombre }).session(session);
    if (usuarioExistente) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ mensaje: 'El nombre ya está registrado.' });
    }

    const usuario = new Usuario({
      nombre,
      email,
      password,
      role,
      accessCode: role === 'superadministrador' ? accessCode : undefined
    });

    await usuario.save({ session });

    // Reducir usos y actualizar estado si es necesario
    codigoValido.usosDisponibles -= 1;
    if (codigoValido.usosDisponibles <= 0) {
      codigoValido.estado = 'inactivo';
    }

    await codigoValido.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      mensaje: 'Usuario registrado con éxito',
      token: 'fake-jwt-token'
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error('Error en registro:', error);

    if (error.code === 11000 && error.keyValue?.email) {
      return res.status(400).json({ mensaje: 'El correo ya está registrado.' });
    }

    res.status(500).json({ mensaje: 'Error al registrar usuario' });
  }
};

module.exports = register;
