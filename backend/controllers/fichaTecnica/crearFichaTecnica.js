const crearFichaTecnicaService = require('@services/fichaTecnica/crearFichaTecnicaService');

const crearFichaTecnica = async (req, res) => {
  try {
    // ⚠️ Aseguramos que la fuente de este endpoint es confiable → estado: activa por defecto
    const data = {
      ...req.body,
      estado: req.body.estado || 'activa', // fuerza "activa" si no se definió
    };

    const ficha = await crearFichaTecnicaService(data);

    return res.status(201).json({
      success: true,
      message: 'Ficha técnica creada correctamente',
      ficha,
    });

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
