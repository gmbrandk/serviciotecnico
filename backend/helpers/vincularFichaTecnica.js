// 📁 helpers/equipos/vincularFichaTecnica.js
const FichaTecnica = require('../../models/FichaTecnica');

const vincularFichaTecnica = async ({ modelo, sku }) => {
  if (!modelo && !sku) return null;

  const query = [];

  if (sku) query.push({ sku: sku.trim() });
  if (modelo) query.push({ modelo: modelo.trim() });

  const ficha = await FichaTecnica.findOne({ $or: query });

  return ficha || null;
};

module.exports = vincularFichaTecnica;
