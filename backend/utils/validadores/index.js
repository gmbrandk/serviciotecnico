// Archivo índice para centralizar y exponer todos los validadores

const { validarBooleano, esBooleano } = require('./validarBooleano');

// Cuando agregues más validadores (como validarString, validarNumero, etc.),
// simplemente los importas aquí y los expones.

module.exports = {
  validarBooleano,
  esBooleano,
  // validarString,
  // validarNumero,
  // validarFecha,
  // validarEmail,
};
