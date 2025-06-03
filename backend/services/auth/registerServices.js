const mongoose = require('mongoose');
const Usuario = require('@models/Usuario');
const CodigoAcceso = require('@models/CodigoAcceso');
const {
  obtenerCreadorPorEntidad,
} = require('@utils/movimientos/obtenerCreadorPorEntidad');
const { crearMovimiento } = require('@controllers/movimientoController');

const isReplicaSet = async () => {
  const admin = mongoose.connection.db.admin();
  const info = await admin.command({ hello: 1 });
  return !!info.setName;
};

const registerService = async ({
  nombre,
  email,
  password,
  role,
  accessCode,
  codigoAcceso,
  activo,
}) => {
  const useTransaction = await isReplicaSet();
  let session = null;

  if (useTransaction) {
    session = await mongoose.startSession();
    session.startTransaction();
  }

  try {
    if (
      role === 'superadministrador' &&
      accessCode !== process.env.SUPER_ADMIN_ACCESS_CODE
    ) {
      throw new Error('Código de acceso inválido para superAdministrador.');
    }

    const codigoValido = await CodigoAcceso.findOne({
      codigo: codigoAcceso,
    }).session(session || undefined);
    if (!codigoValido || codigoValido.usosDisponibles < 1) {
      throw new Error('Código de acceso inválido o sin usos disponibles.');
    }

    const emailExistente = await Usuario.findOne({ email }).session(
      session || undefined
    );
    if (emailExistente) {
      throw new Error('El correo ya está registrado.');
    }

    const usuarioExistente = await Usuario.findOne({ nombre }).session(
      session || undefined
    );
    if (usuarioExistente) {
      throw new Error('El nombre ya está registrado.');
    }

    const nuevoUsuario = new Usuario({
      nombre,
      email,
      password,
      role,
      accessCode: role === 'superadministrador' ? accessCode : undefined,
      activo,
    });

    await nuevoUsuario.save({ session: session || undefined });

    codigoValido.usosDisponibles -= 1;
    if (codigoValido.usosDisponibles <= 0) {
      codigoValido.estado = 'inactivo';
    }

    await codigoValido.save({ session: session || undefined });

    const creadorDelCodigo = await obtenerCreadorPorEntidad(
      'CodigoAcceso',
      codigoValido._id,
      session
    );
    if (!creadorDelCodigo) {
      throw new Error('No se pudo determinar quién creó el código de acceso.');
    }

    await crearMovimiento(
      {
        tipo: 'uso_codigo',
        descripcion: `El usuario ${nombre} usó el código ${codigoValido.codigo} creado por ${creadorDelCodigo.nombre}.`,
        entidad: 'CodigoAcceso',
        entidadId: codigoValido._id,
        usuarioId: creadorDelCodigo._id,
        usadoPor: nuevoUsuario._id,
        fecha: new Date(),
      },
      { session: session || undefined }
    );

    if (session) await session.commitTransaction();

    return {
      _id: nuevoUsuario._id,
      nombre: nuevoUsuario.nombre,
      email: nuevoUsuario.email,
      role: nuevoUsuario.role,
      activo: nuevoUsuario.activo,
    };
  } catch (error) {
    if (session) await session.abortTransaction();
    throw error;
  } finally {
    if (session) session.endSession();
  }
};

module.exports = registerService;
