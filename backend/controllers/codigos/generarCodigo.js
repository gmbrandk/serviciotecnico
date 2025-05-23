const CodigoAcceso = require('@models/CodigoAcceso');
const crypto = require('crypto');
const { logError } = require('@utils/logger');
const { crearMovimiento } = require('@controllers/movimientoController');

const generarCodigo = async (req, res) => {
  const usuario = req.usuario;
  const rolUsuario = usuario.role?.toLowerCase();

  if (!['superadministrador', 'administrador'].includes(rolUsuario)) {
    return res.status(403).json({ success: false, mensaje: 'Acceso denegado' });
  }

  const usos = req.body.usos;
  if (
    usos !== undefined &&
    (typeof usos !== 'number' ||
      isNaN(usos) ||
      usos < 1 ||
      usos > 5 ||
      !Number.isInteger(usos))
  ) {
    return res.status(400).json({
      success: false,
      mensaje: 'El número de usos debe ser un entero entre 1 y 5',
    });
  }

  try {
    let nuevoCodigo, existe;
    do {
      nuevoCodigo = crypto.randomBytes(4).toString('hex').toUpperCase();
      existe = await CodigoAcceso.findOne({ codigo: nuevoCodigo });
    } while (existe);

    const codigo = new CodigoAcceso({
      codigo: nuevoCodigo,
      usosDisponibles: usos,
      estado: 'activo',
      fechaCreacion: new Date(),
      creadoPor: usuario._id, // ✅ Asignar el creador directamente
    });

    await codigo.save();

    await crearMovimiento({
      tipo: 'crear',
      descripcion: `El usuario ${usuario.nombre} (${
        usuario.role
      }) generó el código de acceso ${codigo.codigo}, con ${
        codigo.usosDisponibles
      } ${
        codigo.usosDisponibles === 1 ? 'uso disponible' : 'usos disponibles'
      }.`,
      entidad: 'CodigoAcceso',
      entidadId: codigo._id,
      usuarioId: usuario._id,
    });

    res.status(201).json({
      success: true,
      mensaje: 'Código generado correctamente',
      codigo: {
        id: codigo._id,
        codigo: codigo.codigo,
        estado: codigo.estado,
        usosDisponibles: codigo.usosDisponibles,
        fechaCreacion: codigo.fechaCreacion,
        creadoPor: {
          id: usuario._id,
          nombre: usuario.nombre,
          email: usuario.email,
          role: usuario.role,
        },
      },
    });
  } catch (error) {
    logError(error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al generar código',
    });
  }
};

module.exports = generarCodigo;
