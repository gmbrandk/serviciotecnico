const CodigoAcceso = require('@models/CodigoAcceso');
const { logError } = require('@utils/logger');

const obtenerCodigos = async (req, res) => {
  try {
    const { estado, creadoPor } = req.query;

    // Construir filtro dinámico
    const filtro = {};
    if (estado) filtro.estado = estado;
    if (creadoPor) filtro.creadoPor = creadoPor;

    const codigos = await CodigoAcceso.find(filtro)
      .sort({ fechaCreacion: -1 })
      .populate('creadoPor', 'nombre email');

    const codigosFormateados = codigos.map((codigo) => ({
      id: codigo._id,
      codigo: codigo.codigo,
      estado: codigo.estado,
      usosDisponibles: codigo.usosDisponibles,
      fechaCreacion: codigo.fechaCreacion,
      creadoPor: codigo.creadoPor
        ? {
            id: codigo.creadoPor._id,
            nombre: codigo.creadoPor.nombre,
            email: codigo.creadoPor.email
          }
        : null
    }));

    res.json({ success: true, codigos: codigosFormateados });
  } catch (error) {
    logError(error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener los códigos de acceso'
    });
  }
};

module.exports = obtenerCodigos;
