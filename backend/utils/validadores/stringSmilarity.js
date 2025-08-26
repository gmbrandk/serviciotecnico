const stringSimilarity = require('string-similarity');

/**
 * 🔍 Normaliza un número de serie:
 * - Mayúsculas
 * - Trim
 * - Reemplazos comunes (O→0, I→1, l→1, S→5, B↔8)
 */
function normalizarNroSerie(nroSerie) {
  if (!nroSerie) return null;

  return nroSerie
    .trim()
    .toUpperCase()
    .replace(/O/g, '0')
    .replace(/[I|L]/g, '1')
    .replace(/S/g, '5')
    .replace(/B/g, '8');
}

/**
 * 🔍 Valida si un nroSerie es sospechosamente similar a otro
 * @param {string} nroSerieIngresado → lo que escribió el usuario
 * @param {string} nroSerieExistente → uno guardado en DB
 * @param {number} [umbral=0.9] → similitud mínima aceptada
 * @returns {object} → { esSimilar: boolean, similitud: number, sugerencia?: string }
 */
function compararNroSeries(nroSerieIngresado, nroSerieExistente, umbral = 0.9) {
  const normalizadoIngresado = normalizarNroSerie(nroSerieIngresado);
  const normalizadoExistente = normalizarNroSerie(nroSerieExistente);

  if (!normalizadoIngresado || !normalizadoExistente) {
    return { esSimilar: false, similitud: 0 };
  }

  const similitud = stringSimilarity.compareTwoStrings(
    normalizadoIngresado,
    normalizadoExistente
  );

  const diferenciaLongitud = Math.abs(
    normalizadoIngresado.length - normalizadoExistente.length
  );

  const esSimilar =
    (similitud >= umbral || diferenciaLongitud === 1) &&
    normalizadoIngresado !== normalizadoExistente;

  return {
    esSimilar,
    similitud,
    sugerencia: esSimilar ? normalizadoExistente : null,
  };
}

module.exports = {
  normalizarNroSerie,
  compararNroSeries,
};
