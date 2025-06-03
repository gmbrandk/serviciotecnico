const generarCodigoService = require('@services/codigos/generarCodigoService');

const generarCodigoController = async (req, res) => {
  try {
    const nuevoCodigo = await generarCodigoService({
      usuarioSolicitante: req.usuario,
      usos: req.body.usos,
    });

    res.status(201).json({
      success: true,
      mensaje: 'Código generado correctamente.',
      codigo: nuevoCodigo,
    });
  } catch (error) {
    console.error('❌ Error al generar código:', error);

    res.status(error.statusCode || 500).json({
      success: false,
      mensaje: error.mensaje || 'Error al generar el código.',
      ...(error.codigoExistente && { codigoExistente: error.codigoExistente }),
    });
  }
};

module.exports = generarCodigoController;
