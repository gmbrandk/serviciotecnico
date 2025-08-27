const stringSimilarity = require('string-similarity');
const levenshtein = require('fast-levenshtein');

/**
 * 🔍 Normaliza un número de serie:
 * - Mayúsculas
 * - Trim
 * - Reemplazos comunes (O→0, I/L→1, S→5, B→8)
 */
function normalizarNroSerie(nroSerie) {
  if (!nroSerie) return null;

  return nroSerie
    .trim()
    .toUpperCase()
    .replace(/O/g, '0')
    .replace(/[IL]/g, '1') // fix regex
    .replace(/S/g, '5')
    .replace(/B/g, '8');
}

/**
 * 🔍 Compara dos números de serie y detecta similitud sospechosa
 * @param {string} nroSerieIngresado → lo que escribió el usuario
 * @param {string} nroSerieExistente → uno guardado en DB
 * @param {number} [umbral=0.9] → similitud mínima aceptada
 * @returns {object} → { esExacto, esSimilar, similitud, distancia, sugerencia? }
 */
function compararNroSeries(nroSerieIngresado, nroSerieExistente, umbral = 0.9) {
  const normalizadoIngresado = normalizarNroSerie(nroSerieIngresado);
  const normalizadoExistente = normalizarNroSerie(nroSerieExistente);

  if (!normalizadoIngresado || !normalizadoExistente) {
    return { esExacto: false, esSimilar: false, similitud: 0, distancia: null };
  }

  const similitud = stringSimilarity.compareTwoStrings(
    normalizadoIngresado,
    normalizadoExistente
  );

  const distancia = levenshtein.get(normalizadoIngresado, normalizadoExistente);
  const esExacto = normalizadoIngresado === normalizadoExistente;

  // Caso sospechoso → alto score de similitud o distancia <= 1 (error humano)
  const esSimilar = !esExacto && (similitud >= umbral || distancia <= 1);

  return {
    esExacto,
    esSimilar,
    similitud,
    distancia,
    sugerencia: esSimilar ? normalizadoExistente : null,
  };
}

module.exports = {
  normalizarNroSerie,
  compararNroSeries,
};
