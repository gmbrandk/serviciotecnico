const mongoose = require('mongoose');
const Usuario = require('@models/Usuario');
const CodigoAcceso = require('@models/CodigoAcceso');

const isReplicaSet = async () => {
  const admin = mongoose.connection.db.admin();
  const info = await admin.command({ hello: 1 });
  return !!info.setName;
};

const register = async (req, res, next) => {
  const { nombre, email, password, role, accessCode, codigoAcceso } = req.body;

  let session = null;
  const useTransaction = await isReplicaSet();
  if (useTransaction) {
    session = await mongoose.startSession();
    session.startTransaction();
  }

  try {
    if (role === 'superadministrador' && accessCode !== process.env.SUPER_ADMIN_ACCESS_CODE) {
      const error = new Error('Código inválido para superAdministrador');
      error.statusCode = 403;
      error.customMessage = 'Código de acceso inválido para superAdministrador.';
      error.details = 'El código de acceso proporcionado no coincide con el configurado.';
      throw error;
    }

    const codigoValido = await CodigoAcceso.findOne({ codigo: codigoAcceso }).session(session || undefined);
    if (!codigoValido) {
      const error = new Error('Código no encontrado.');
      error.statusCode = 403;
      error.customMessage = 'Código de acceso inválido.';
      error.details = 'El código ingresado no se encontró en la base de datos.';
      throw error;
    }

    if (codigoValido.usosDisponibles < 1) {
      const error = new Error('Código sin usos disponibles.');
      error.statusCode = 403;
      error.customMessage = 'Código sin usos disponibles.';
      error.details = `El código ya ha sido utilizado en su totalidad.`;
      throw error;
    }

    const emailExistente = await Usuario.findOne({ email }).session(session || undefined);
    if (emailExistente) {
      const error = new Error('Correo duplicado.');
      error.statusCode = 400;
      error.customMessage = 'El correo ya está registrado.';
      error.details = { email };
      throw error;
    }

    const usuarioExistente = await Usuario.findOne({ nombre }).session(session || undefined);
    if (usuarioExistente) {
      const error = new Error('Nombre duplicado.');
      error.statusCode = 400;
      error.customMessage = 'El nombre ya está registrado.';
      error.details = { nombre };
      throw error;
    }

    const usuario = new Usuario({
      nombre,
      email,
      password,
      role,
      accessCode: role === 'superadministrador' ? accessCode : undefined
    });

    await usuario.save({ session: session || undefined });

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
    next(error); // 🔁 Delegamos al middleware de errores
  }
};

module.exports = register;
