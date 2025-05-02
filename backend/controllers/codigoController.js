const CodigoAcceso = require('@models/CodigoAcceso');
const crypto = require('crypto');
const { logError } = require('@utils/logger');

const generarCodigoAcceso = async (req, res) => {
  const usuario = req.usuario;
  const rolUsuario = usuario.role?.toLowerCase();

  if (rolUsuario !== 'superadministrador' && rolUsuario !== 'administrador') {
    return res.status(403).json({ mensaje: 'Acceso denegado' });
  }

  // 💡 Solo convertir a número si viene definido
  let usos;
  if (req.body.usos !== undefined) {
    usos = Number(req.body.usos);

    if (isNaN(usos) || usos < 1 || usos > 5 || !Number.isInteger(usos)) {
      return res.status(400).json({ mensaje: 'El número de usos debe ser un entero entre 1 y 5' });
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
      usosDisponibles: usos, // será undefined → mongoose usa default: 1
      creadoPor: usuario.id,
      estado: 'activo',
      fechaCreacion: new Date(),
    });

    await codigo.save();

    res.status(201).json({
      success: true,
      codigo: {
        id: codigo._id,
        codigo: codigo.codigo,
        estado: codigo.estado,
        usosDisponibles: codigo.usosDisponibles,
        fechaCreacion: codigo.fechaCreacion,
      },
    });
  } catch (error) {
    logError(error);
    res.status(500).json({ mensaje: 'Error al generar código' });
  }
};

const obtenerCodigos = async (req, res) => {
  try {
    const codigos = await CodigoAcceso.find().sort({ fechaCreacion: -1 });
    res.status(200).json({ codigos });
  } catch (error) {
    logError(error);
    res.status(500).json({ mensaje: 'Error al obtener los códigos de acceso' });
  }
};

module.exports = { generarCodigoAcceso, obtenerCodigos };
