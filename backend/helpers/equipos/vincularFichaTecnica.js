// 📁 helpers/equipos/vincularFichaTecnica.js

const FichaTecnica = require('@models/FichaTecnica');
const normalizarNombreTecnico = require('@utils/formatters/normalizarNombreTecnico');


/**
 * Busca una ficha técnica por marca + modelo.
 * Si existe, la devuelve para usar sus campos.
 * @param {Object} opciones
 * @param {string} opciones.marca
 * @param {string} opciones.modelo
 * @returns {Promise<FichaTecnica|null>}
 */
const vincularFichaTecnica = async ({ marca, modelo }) => {
  const nombreTecnico = normalizarNombreTecnico(marca, modelo);
  if (!nombreTecnico) return null;

  return await FichaTecnica.findOne({ modelo: nombreTecnico });
};

module.exports = vincularFichaTecnica;
