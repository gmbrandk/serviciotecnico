/**
 * Valida que un valor sea estrictamente booleano (true o false).
 * Útil para campos como `activo`, `esAdmin`, `habilitado`, etc.
 *
 * @param {*} valor - El valor a validar.
 * @param {string} nombreCampo - El nombre del campo (para mensajes de error).
 * @throws {Error} Si el valor no es un booleano.
 */
function validarBooleano(valor, nombreCampo = 'campo') {
  if (typeof valor !== 'boolean') {
    throw new Error(
      `El campo "${nombreCampo}" debe ser booleano (true o false).`
    );
  }
  return true;
}

/**
 * Valida que un valor sea estrictamente booleano (true o false),
 * pero no lanza excepción. Devuelve true si es válido, false si no.
 *
 * @param {*} valor - El valor a validar.
 * @returns {boolean} true si es booleano válido, false si no.
 */
function esBooleano(valor) {
  return typeof valor === 'boolean';
}

module.exports = {
  validarBooleano,
  esBooleano,
};
