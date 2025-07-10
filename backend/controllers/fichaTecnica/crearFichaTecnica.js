const crearFichaTecnicaService = require('@services/fichaTecnica/crearFichaTecnicaService');

const crearFichaTecnica = async (req, res) => {
  try {
    const ficha = await crearFichaTecnicaService(req.body);
    return res.status(201).json({ ficha });
  } catch (err) {
    console.error('[❌ Error en crearFichaTecnica]:', err);
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Error al crear ficha técnica',
      details: err.details || null,
    });
  }
};

module.exports = crearFichaTecnica;
