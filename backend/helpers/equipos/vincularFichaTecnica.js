// 📁 helpers/equipos/vincularFichaTecnica.js

const FichaTecnica = require('@models/FichaTecnica');
const normalizarNombreTecnico = require('@utils/formatters/normalizarNombreTecnico');

/**
 * Busca una ficha técnica por SKU o por marca + modelo.
 * Si existe, la devuelve para usar sus campos.
 * @param {Object} opciones
 * @param {string} [opciones.sku]
 * @param {string} opciones.marca
 * @param {string} opciones.modelo
 * @returns {Promise<FichaTecnica|null>}
 */
const vincularFichaTecnica = async ({ sku, marca, modelo }) => {
  if (sku) {
    const fichaPorSku = await FichaTecnica.findOne({
      sku: sku.trim().toUpperCase(),
    });
    if (fichaPorSku) return fichaPorSku;
  }

  const nombreTecnico = normalizarNombreTecnico(marca, modelo);
  if (!nombreTecnico) return null;

  return await FichaTecnica.findOne({ modelo: nombreTecnico });
};

module.exports = vincularFichaTecnica;
