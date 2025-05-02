// backend/controllers/codigoController.js
const CodigoAcceso = require('../models/CodigoAcceso');
const crypto = require('crypto');
const { logError } = require('@utils/logger');

const generarCodigoAcceso = async (req, res) => {
  const usuario = req.usuario; // esto se rellena con middleware de auth
  const { usos = 1} = req.body;

  // Aceptamos superAdministrador o administrador (sin importar mayúsculas)
  const rolUsuario = usuario.role?.toLowerCase();
  if (rolUsuario !== 'superadministrador' && rolUsuario !== 'administrador') {
    return res.status(403).json({ mensaje: 'Acceso denegado' });
  }

  // Validar rango de usos
  if (typeof usos !== 'number' || usos < 1 || usos > 5) {
    return res.status(400).json({ mensaje: 'El número de usos debe estar entre 1 y 5' });
  }

  try {
    const nuevoCodigo = crypto.randomBytes(4).toString('hex').toUpperCase(); // ejemplo: "3F4A9C2B"
    
    const codigo = new CodigoAcceso({
      codigo: nuevoCodigo,
      usosDisponibles: usos,
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
    const codigos = await CodigoAcceso.find().sort({ fechaCreacion: -1 }); // más recientes primero
    res.status(200).json({codigos});
  } catch (error) {
    logError(error);
    res.status(500).json({ mensaje: 'Error al obtener los códigos de acceso' });
  }
};


module.exports = { generarCodigoAcceso, obtenerCodigos };
