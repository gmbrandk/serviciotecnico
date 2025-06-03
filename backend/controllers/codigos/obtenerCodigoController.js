const obtenerCodigosService = require('@services/codigos/obtenerCodigoService');
const { logError } = require('@utils/logger');

const obtenerCodigos = async (req, res) => {
  try {
    const codigos = await obtenerCodigosService(req.query);

    res.json({
      success: true,
      codigos,
    });
  } catch (error) {
    logError(error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener los códigos de acceso',
    });
  }
};

module.exports = obtenerCodigos;
