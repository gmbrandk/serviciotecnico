// backend/controllers/codigoController.js
const CodigoAcceso = require('../models/CodigoAcceso');
const crypto = require('crypto');

const generarCodigoAcceso = async (req, res) => {
  const usuario = req.usuario; // esto se rellena con middleware de auth
  const { usos = 1} = req.body;

  // Aceptamos superAdministrador o administrador (sin importar mayúsculas)
  const rolUsuario = usuario.role?.toLowerCase();
  if (rolUsuario !== 'superadministrador' && rolUsuario !== 'administrador') {
    return res.status(403).json({ mensaje: 'Acceso denegado' });
  }

  try {
    const nuevoCodigo = crypto.randomBytes(4).toString('hex').toUpperCase(); // ejemplo: "3F4A9C2B"
    
    const codigo = new CodigoAcceso({
      codigo: nuevoCodigo,
      usosDisponibles: usos,
      creadoPor: usuario.id,
    });

    await codigo.save();

    res.status(201).json({ success: true, codigo: nuevoCodigo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al generar código' });
  }
};

module.exports = { generarCodigoAcceso };
