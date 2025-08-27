// utils/normalizeField.js
function normalizeField(value, options = {}) {
  if (!value) return { original: null, normalizado: null };

  const original = value.trim();

  // Estrategia básica: mayúsculas y quitar caracteres no alfanuméricos
  let normalizado = original;

  if (options.uppercase) {
    normalizado = normalizado.toUpperCase();
  }

  if (options.removeNonAlnum) {
    normalizado = normalizado.replace(/[^A-Z0-9]/gi, '');
  }

  if (options.lowercase) {
    normalizado = normalizado.toLowerCase();
  }

  return { original, normalizado };
}

module.exports = normalizeField;
