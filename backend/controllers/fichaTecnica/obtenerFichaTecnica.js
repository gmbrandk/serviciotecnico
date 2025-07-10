const FichaTecnica = require('@models/FichaTecnica');
const generarTokensBusqueda = require('@utils/generadores/tokens');

const obtenerFichaTecnica = async (req, res) => {
  try {
    const { modelo, raw = false } = req.query;

    if (!modelo) {
      return res.status(400).json({ message: 'Debes enviar el modelo' });
    }

    const filtros = [];

    // 🎯 Match inteligente por tokens
    const tokens = generarTokensBusqueda(modelo);
    if (tokens.length > 0) {
      filtros.push({ tokensBusqueda: { $all: tokens } });
    }

    // 🔍 Fallback si se activa el modo raw (búsqueda parcial por texto)
    if (raw) {
      filtros.push({ modelo: new RegExp(modelo, 'i') });
    }

    // 🧠 Condición combinada: solo fichas activas
    const query = {
      isActiva: true,
      estado: 'activa',
      ...(filtros.length > 0 ? { $or: filtros } : {}),
    };

    const fichas = await FichaTecnica.find(query).limit(10).lean();

    if (!fichas.length) {
      return res
        .status(404)
        .json({ message: 'No se encontraron coincidencias' });
    }

    return res.json({ resultados: fichas });
  } catch (err) {
    console.error('❗ Error en obtenerFichaTecnica:', err);
    return res.status(500).json({ message: 'Error al buscar ficha técnica' });
  }
};

module.exports = obtenerFichaTecnica;
