const crearOrdenServicioController = require('./ordenServicio/crearOrdenServicioController');
const actualizarOrdenServicioController = require('./ordenServicio/ActualizarOrdenServicioController');
const obtenerOrdenServicioController = require('./ordenServicio/obtenerOrdenServicioController');
const anularOrdenServicioController = require('./ordenServicio/anularOrdenServicioController');

module.exports = {
  crearOrdenServicioController,
  actualizarOrdenServicioController,
  obtenerOrdenServicioController,
  anularOrdenServicioController,
};
