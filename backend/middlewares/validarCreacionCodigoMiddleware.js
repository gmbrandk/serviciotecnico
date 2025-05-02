const CodigoAcceso = require('@models/CodigoAcceso');

const validarCreacionCodigo = async (req, res, next) => {
  try {
    const codigoActivo = await CodigoAcceso.findOne({ estado: 'activo' });

    if (codigoActivo) {
      return res.status(409).json({
        mensaje: 'Ya existe un código activo. No se puede generar otro.',
        codigoExistente: codigoActivo.codigo,
      });
    }

    next();
  } catch (error) {
    console.error('Error en validarCreacionCodigo:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

module.exports = validarCreacionCodigo;
