// 📁 helpers/equipos/vincularFichaTecnica.js

const FichaTecnica = require('@models/FichaTecnica');
const generarNombreTecnico = require('@utils/formatters/normalizarNombreTecnico');

const vincularFichaTecnica = async ({ marca, modelo }) => {
  const nombreTecnico = generarNombreTecnico(marca, modelo);
  if (!nombreTecnico) return null;

  const ficha = await FichaTecnica.findOne({ modelo: nombreTecnico });
  return ficha;
};

module.exports = vincularFichaTecnica;
