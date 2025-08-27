// 📁 services/equipos/vincularFichaTecnica.js
const FichaTecnica = require('@models/FichaTecnica');
const normalizeField = require('@utils/normalizeField');

/**
 * Vincula un equipo con su ficha técnica.
 * Estrategia:
 *   1) Buscar por SKU normalizado
 *   2) Buscar por marca + modelo normalizado
 *   3) Buscar por tokens de búsqueda
 *
 * @param {Object} opciones
 * @param {string} [opciones.sku]
 * @param {string} opciones.marca
 * @param {string} opciones.modelo
 * @returns {Promise<FichaTecnica|null>}
 */
const vincularFichaTecnica = async ({ sku, marca, modelo }) => {
  // 1️⃣ Buscar por SKU normalizado
  if (sku) {
    const { normalizado } = normalizeField(sku, {
      uppercase: true,
      removeNonAlnum: true,
    });

    const fichaPorSku = await FichaTecnica.findOne({
      skuNormalizado: normalizado,
    });
    if (fichaPorSku) return fichaPorSku;
  }

  // 2️⃣ Buscar por marca + modelo normalizado
  if (marca && modelo) {
    const { normalizado: modeloNorm } = normalizeField(modelo, {
      uppercase: true,
      removeNonAlnum: true,
    });

    const fichaPorModelo = await FichaTecnica.findOne({
      marca: marca.trim().toUpperCase(),
      modeloNormalizado: modeloNorm,
    });

    if (fichaPorModelo) return fichaPorModelo;
  }

  // 3️⃣ Fallback: búsqueda por tokens
  if (marca && modelo) {
    const tokens = [
      ...marca.trim().toLowerCase().split(/\s+/),
      ...modelo
        .trim()
        .toLowerCase()
        .split(/[\s\-]+/),
    ];

    const fichaPorTokens = await FichaTecnica.findOne({
      tokensBusqueda: { $all: tokens },
    });

    if (fichaPorTokens) return fichaPorTokens;
  }

  return null;
};

module.exports = vincularFichaTecnica;
