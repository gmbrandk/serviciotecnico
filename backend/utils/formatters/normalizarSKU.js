/**
 * 🔠 normalizarSKU
 * Limpia y estandariza el SKU para asegurar consistencia:
 * - Convierte a mayúsculas
 * - Elimina tildes y caracteres especiales
 * - Permite solo letras, números y guiones
 *
 * @param {string} skuRaw - El SKU original ingresado
 * @returns {string} SKU normalizado
 */
const normalizarSKU = (skuRaw = '') => {
  return skuRaw
    .toString()
    .normalize('NFKD') // Elimina tildes
    .replace(/[\u0300-\u036f]/g, '') // Elimina marcas de acento
    .replace(/[^\w\-]/g, '') // Elimina todo excepto letras, números y guiones
    .replace(/\s+/g, '') // Elimina espacios
    .toUpperCase(); // A mayúsculas
};

module.exports = normalizarSKU;
