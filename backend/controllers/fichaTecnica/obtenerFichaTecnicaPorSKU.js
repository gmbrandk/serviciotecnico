// controllers/fichaTecnica/buscarFichaTecnicaPorSKUController.js

const FichaTecnica = require('@models/FichaTecnica');
const { sendSuccess, sendError } = require('@utils/httpResponse');
const { ValidationError } = require('@utils/errors');

/**
 * GET /fichatecnica/por-sku?sku=...
 * Permite búsqueda parcial y flexible por SKU
 */
const buscarFichaTecnicaPorSKUController = async (req, res) => {
  try {
    const rawSKU = req.query.sku || req.body?.sku;

    if (!rawSKU || rawSKU.trim().length < 2) {
      throw new ValidationError(
        'Debes proporcionar un SKU válido (mínimo 2 caracteres)'
      );
    }

    const query = rawSKU.trim();

    // 🧠 Expresión regular flexible insensible a mayúsculas
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const fichas = await FichaTecnica.find({
      sku: regex,
    }).limit(10); // 🔒 Ajusta según necesidad

    if (fichas.length === 0) {
      return sendError(res, {
        status: 404,
        message: `No se encontraron fichas técnicas con SKU parecido a "${query}"`,
      });
    }

    return sendSuccess(res, {
      message: `Se encontraron ${fichas.length} coincidencia(s)`,
      details: { fichas },
    });
  } catch (err) {
    return sendError(res, {
      status: err.status || 500,
      message: err.message || 'Error al buscar ficha técnica por SKU',
    });
  }
};

module.exports = buscarFichaTecnicaPorSKUController;
