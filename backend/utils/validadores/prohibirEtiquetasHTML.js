// utils/validadores/prohibirEtiquetasHTML.js

const { ValidationError } = require('@utils/errors');

/**
 * Lanza un error si el campo contiene etiquetas HTML o JS
 * @param {string} valor - Texto a validar
 * @param {string} campo - Nombre del campo para el mensaje de error
 */
function prohibirEtiquetasHTML(valor, campo) {
  const regex = /<[^>]*>/g;
  if (typeof valor === 'string' && regex.test(valor)) {
    throw new ValidationError(
      `El campo "${campo}" contiene código no permitido`
    );
  }
}

module.exports = prohibirEtiquetasHTML;
