const obtenerMovimientosService = require('@services/movimientos/obtenerMovimientoService');

const obtenerMovimientosController = async (req, res) => {
  try {
    const historial = await obtenerMovimientosService(req.query);

    res.json({ success: true, historial });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener historial',
    });
  }
};

module.exports = obtenerMovimientosController;
