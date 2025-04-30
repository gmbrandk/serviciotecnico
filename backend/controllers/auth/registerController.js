const mongoose = require('mongoose');
const Usuario = require('@models/Usuario');
const CodigoAcceso = require('@models/CodigoAcceso');

// Verifica si la base de datos está en un Replica Set
const isReplicaSet = async () => {
  const admin = mongoose.connection.db.admin();
  const info = await admin.command({ hello: 1 }); // o { isMaster: 1 }
  return !!info.setName;
};

const register = async (req, res) => {
  const { nombre, email, password, role, accessCode, codigoAcceso } = req.body;

  let session = null;
  const useTransaction = await isReplicaSet();
  if (useTransaction) {
    session = await mongoose.startSession();
    session.startTransaction();
  }

  try {
    if (role === 'superadministrador' && accessCode !== process.env.SUPER_ADMIN_ACCESS_CODE) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(403).json({ mensaje: 'Código de acceso inválido para superAdministrador.' });
    }

    const codigoValido = await CodigoAcceso.findOne({ codigo: codigoAcceso }).session(session || undefined);
    if (!codigoValido || codigoValido.usosDisponibles < 1) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(403).json({ mensaje: 'Código de acceso inválido o sin usos disponibles.' });
    }

    const emailExistente = await Usuario.findOne({ email }).session(session || undefined);
    if (emailExistente) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(400).json({ mensaje: 'El correo ya está registrado.' });
    }

    const usuarioExistente = await Usuario.findOne({ nombre }).session(session || undefined);
    if (usuarioExistente) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(400).json({ mensaje: 'El nombre ya está registrado.' });
    }

    const usuario = new Usuario({
      nombre,
      email,
      password,
      role,
      accessCode: role === 'superadministrador' ? accessCode : undefined
    });

    await usuario.save({ session: session || undefined });

    // Reducir usos y actualizar estado si es necesario
    codigoValido.usosDisponibles -= 1;
    if (codigoValido.usosDisponibles <= 0) {
      codigoValido.estado = 'inactivo';
    }

    await codigoValido.save({ session: session || undefined });

    if (session) {
      await session.commitTransaction();
      session.endSession();
    }

    res.status(201).json({
      success: true,
      mensaje: 'Usuario registrado con éxito',
      token: 'fake-jwt-token'
    });

  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }

    console.error('Error en registro:', error);

    if (error.code === 11000 && error.keyValue?.email) {
      return res.status(400).json({ mensaje: 'El correo ya está registrado.' });
    }

    res.status(500).json({ mensaje: 'Error al registrar usuario' });
  }
};

module.exports = register;
