const crearFichaTecnica = require('./fichaTecnica/crearFichaTecnica');
const editarFichaTecnica = require('./fichaTecnica/editarFichaTecnica');
const {
  suspenderFichaTecnica,
  reactivarFichaTecnica,
  eliminarFichaTecnica,
} = require('./fichaTecnica/estadoFichaTecnica');
const obtenerFichaTecnica = require('./fichaTecnica/obtenerFichaTecnica');
const buscarFichaTecnicaPorSKUController = require('./fichaTecnica/obtenerFichaTecnicaPorSKU');

module.exports = {
  crearFichaTecnica,
  editarFichaTecnica,
  suspenderFichaTecnica,
  reactivarFichaTecnica,
  eliminarFichaTecnica,
  obtenerFichaTecnica,
  buscarFichaTecnicaPorSKUController,
};
