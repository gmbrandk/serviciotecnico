// 📁 utils/validadores/validarIdentificadores.js
const stringSimilarity = require('string-similarity');
const levenshtein = require('fast-levenshtein');

/* ==========================================================
   🔧 Normalizadores
   ========================================================== */
function normalizarNroSerie(nroSerie) {
  if (!nroSerie) return null;
  return nroSerie.trim().toUpperCase();
}

function normalizarMac(mac) {
  if (!mac) return null;
  return mac
    .trim()
    .toUpperCase()
    .replace(/[^A-F0-9]/g, ''); // elimina separadores y no-hex
}

function normalizarImei(imei) {
  if (!imei) return null;
  return imei.trim().replace(/\D/g, ''); // solo dígitos
}

/* ==========================================================
   🔍 Comparador genérico
   ========================================================== */
function compararStrings(strIngresado, strExistente, umbral = 0.9) {
  if (!strIngresado || !strExistente) {
    return { esExacto: false, esSimilar: false, similitud: 0, distancia: null };
  }

  const similitud = stringSimilarity.compareTwoStrings(
    strIngresado,
    strExistente
  );
  const distancia = levenshtein.get(strIngresado, strExistente);

  const esExacto = strIngresado === strExistente;
  const esSimilar = !esExacto && (similitud >= umbral || distancia <= 1);

  return {
    esExacto,
    esSimilar,
    similitud,
    distancia,
    sugerencia: esSimilar ? strExistente : null,
  };
}

/* ==========================================================
   🔍 Wrappers específicos por tipo
   ========================================================== */
function compararNroSeries(nroSerieIngresado, nroSerieExistente, umbral = 0.9) {
  return compararStrings(
    normalizarNroSerie(nroSerieIngresado),
    normalizarNroSerie(nroSerieExistente),
    umbral
  );
}

function compararMacs(macIngresada, macExistente, umbral = 0.95) {
  return compararStrings(
    normalizarMac(macIngresada),
    normalizarMac(macExistente),
    umbral
  );
}

function compararImeis(imeiIngresado, imeiExistente, umbral = 0.95) {
  return compararStrings(
    normalizarImei(imeiIngresado),
    normalizarImei(imeiExistente),
    umbral
  );
}

/* ==========================================================
   📦 Export
   ========================================================== */
module.exports = {
  normalizarNroSerie,
  normalizarMac,
  normalizarImei,
  compararNroSeries,
  compararMacs,
  compararImeis,
};
