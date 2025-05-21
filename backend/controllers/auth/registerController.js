const mongoose = require('mongoose');
const Usuario = require('@models/Usuario');
const CodigoAcceso = require('@models/CodigoAcceso');
const Movimiento = require('@models/Movimiento');
const { obtenerCreadorPorEntidad } = require('@utils/movimientos/obtenerCreadorPorEntidad');

const isReplicaSet = async () => {
  const admin = mongoose.connection.db.admin();
  const info = await admin.command({ hello: 1 });
  return !!info.setName;
};

const register = async (req, res) => {
  const { nombre, email, password, role, accessCode, codigoAcceso, activo } = req.body;

  let session = null;
  const useTransaction = await isReplicaSet();
  if (useTransaction) {
    session = await mongoose.startSession();
    session.startTransaction();
  }

  try {
    if (role === 'superadministrador' && accessCode !== process.env.SUPER_ADMIN_ACCESS_CODE) {
      if (session) await session.abortTransaction();
      return res.status(403).json({
        success: false,
        mensaje: 'Código de acceso inválido para superAdministrador.',
        usuario: null
      });
    }

    const codigoValido = await CodigoAcceso.findOne({ codigo: codigoAcceso }).session(session || undefined);
    if (!codigoValido || codigoValido.usosDisponibles < 1) {
      if (session) await session.abortTransaction();
      return res.status(403).json({
        success: false,
        mensaje: 'Código de acceso inválido o sin usos disponibles.',
        usuario: null
      });
    }

    const emailExistente = await Usuario.findOne({ email }).session(session || undefined);
    if (emailExistente) {
      if (session) await session.abortTransaction();
      return res.status(400).json({
        success: false,
        mensaje: 'El correo ya está registrado.',
        usuario: null
      });
    }

    const usuarioExistente = await Usuario.findOne({ nombre }).session(session || undefined);
    if (usuarioExistente) {
      if (session) await session.abortTransaction();
      return res.status(400).json({
        success: false,
        mensaje: 'El nombre ya está registrado.',
        usuario: null
      });
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

    // ✅ Aquí usamos la función reutilizable
    const creadorDelCodigo = await obtenerCreadorPorEntidad('CodigoAcceso', codigoValido._id, session);

    const movimiento = await Movimiento.findById(idMovimiento);
    console.log('Descripción en la consulta:', movimiento.descripcion);
    
    if (!creadorDelCodigo) {
      throw new Error('No se pudo determinar quién creó el código de acceso.');
    }

    await Movimiento.create([{
      tipo: 'uso_codigo',
      descripcion: `El usuario ${nombre} usó el código de acceso.`,
      entidad: 'CodigoAcceso',
      entidadId: codigoValido._id,
      realizadoPor: creadorDelCodigo._id,
      usadoPor: nuevoUsuario._id,
      fecha: new Date()
    }], { session: session || undefined });

    if (session) await session.commitTransaction();

    res.status(201).json({
      success: true,
      mensaje: 'Usuario registrado con éxito',
      usuario: {
        _id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        role: nuevoUsuario.role,
        activo: nuevoUsuario.activo,
      }
    });

  } catch (error) {
    if (session) await session.abortTransaction();
    console.error('Error en registro:', error);

    res.status(500).json({
      success: false,
      mensaje: 'Error al registrar usuario',
      detalles: error.message,
      usuario: null
    });
  } finally {
    if (session) session.endSession();
  }
};

module.exports = register;
