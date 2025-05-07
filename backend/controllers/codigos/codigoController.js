const CodigoAcceso = require('@models/CodigoAcceso');
const crypto = require('crypto');
const { logError } = require('@utils/logger');

const generarCodigoAcceso = async (req, res) => {
  const usuario = req.usuario;
  const rolUsuario = usuario.role?.toLowerCase();

  if (rolUsuario !== 'superadministrador' && rolUsuario !== 'administrador') {
    return res.status(403).json({ success: false, mensaje: 'Acceso denegado' });
  }

  let usos;
  if (req.body.usos !== undefined) {
    usos = req.body.usos;

    if (
      typeof usos !== 'number' ||
      isNaN(usos) ||
      usos < 1 ||
      usos > 5 ||
      !Number.isInteger(usos)
    ) {
      return res.status(400).json({
        success: false,
        mensaje: 'El número de usos debe ser un entero entre 1 y 5'
      });
    }
  }

  try {
    let nuevoCodigo;
    let existe = true;

    do {
      nuevoCodigo = crypto.randomBytes(4).toString('hex').toUpperCase();
      existe = await CodigoAcceso.findOne({ codigo: nuevoCodigo });
    } while (existe);

    const codigo = new CodigoAcceso({
      codigo: nuevoCodigo,
      usosDisponibles: usos,
      creadoPor: usuario._id,
      estado: 'activo',
      fechaCreacion: new Date(),
    });

    await codigo.save();

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
        }
      }
    });
  } catch (error) {
    logError(error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al generar código'
    });
  }
};

const obtenerCodigos = async (req, res) => {
  try {
    const codigos = await CodigoAcceso.find()
      .populate('creadoPor', 'nombre email role')
      .sort({ fechaCreacion: -1 });

    res.status(200).json({
      success: true,
      codigos,
    });
  } catch (error) {
    logError(error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener los códigos de acceso'
    });
  }
};

module.exports = {
  generarCodigoAcceso,
  obtenerCodigos
};
