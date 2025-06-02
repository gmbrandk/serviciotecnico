const CodigoAcceso = require('@models/CodigoAcceso');
const crypto = require('crypto');
const { crearMovimiento } = require('@controllers/movimientoController');

const generarCodigoService = async ({ usuarioSolicitante, usos = 1 }) => {
  const usuario = usuarioSolicitante;

  const codigoActivo = await CodigoAcceso.findOne({
    estado: 'activo',
    usosDisponibles: { $gt: 0 },
  });

  if (codigoActivo) {
    throw {
      statusCode: 409,
      mensaje:
        'Ya existe un código activo con usos disponibles. No se puede generar otro.',
      codigoExistente: codigoActivo.codigo,
    };
  }
  // Validación de usos
  if (
    usos !== undefined &&
    (typeof usos !== 'number' ||
      isNaN(usos) ||
      usos < 1 ||
      usos > 5 ||
      !Number.isInteger(usos))
  ) {
    const error = new Error('El número de usos debe ser un entero entre 1 y 5');
    error.statusCode = 400;
    throw error;
  }

  // Generar código único
  let nuevoCodigo, existe;
  do {
    nuevoCodigo = crypto.randomBytes(4).toString('hex').toUpperCase();
    existe = await CodigoAcceso.findOne({ codigo: nuevoCodigo });
  } while (existe);

  // Crear código en DB
  const codigo = new CodigoAcceso({
    codigo: nuevoCodigo,
    usosDisponibles: usos,
    estado: 'activo',
    fechaCreacion: new Date(),
    creadoPor: usuario._id,
  });

  await codigo.save();

  // Registrar movimiento
  await crearMovimiento({
    tipo: 'crear',
    descripcion: `El usuario ${usuario.nombre} (${usuario.role}) generó el código ${codigo.codigo}, con ${codigo.usosDisponibles} uso(s).`,
    entidad: 'CodigoAcceso',
    entidadId: codigo._id,
    usuarioId: usuario._id,
  });

  // Retornar DTO (respuesta formateada)
  return {
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
  };
};

module.exports = generarCodigoService;
