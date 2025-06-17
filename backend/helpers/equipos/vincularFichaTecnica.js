const FichaTecnica = require('../../models/FichaTecnica');

const vincularFichaTecnica = async ({ modelo, sku }) => {
  if (!modelo && !sku) return null;

  const query = [];
  if (sku?.trim()) query.push({ sku: sku.trim() });
  if (modelo?.trim()) query.push({ modelo: modelo.trim() });

  if (!query.length) return null;

  const ficha = await FichaTecnica.findOne({ $or: query });
  return ficha ?? null;
};

module.exports = vincularFichaTecnica;
