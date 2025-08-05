const crearFichaTecnicaService = require('@services/fichaTecnica/crearFichaTecnicaService');
const generarNombreTecnico = require('@utils/formatters/normalizarNombreTecnico');

const crearFichaTecnica = async (req, res) => {
  try {
    // ⚠️ Aseguramos que la fuente de este endpoint es confiable → estado: activa por defecto
    const data = {
      ...req.body,
      estado: req.body.estado || 'activa',
    };

    const ficha = await crearFichaTecnicaService(data);

    // 🔍 Generamos el nombre técnico en memoria
    const nombreTecnico = generarNombreTecnico(ficha.marca, ficha.modelo);

    return res.status(201).json({
      success: true,
      message: 'Ficha técnica creada correctamente',
      ficha,
      nombreTecnico, // lo devolvemos explícitamente para test o verificación
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
