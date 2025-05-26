const {
  generarCodigoService,
} = require('../../services/codigos/generarCodigoService');
const { logError } = require('@utils/logger');

const generarCodigo = async (req, res) => {
  try {
    const resultado = await generarCodigoService(req.usuario, req.body.usos);

    res.status(201).json({
      success: true,
      mensaje: 'Código generado correctamente',
      codigo: resultado,
    });
  } catch (error) {
    logError(error);
    res.status(error.status || 500).json({
      success: false,
      mensaje: error.mensaje || 'Error al generar código',
    });
  }
};

module.exports = generarCodigo;
