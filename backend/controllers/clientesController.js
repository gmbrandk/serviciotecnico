const buscarClientesController = require('./clientes/buscarClientesController');
const calificarClienteController = require('./clientes/calificarController');
const crearClienteController = require('./clientes/crearClienteController');
const editarClienteController = require('./clientes/editarClienteController');
const {
  suspender,
  reactivar,
  confirmarBaja,
} = require('./clientes/estadoClienteController');
const obtenerClientePorIdController = require('./clientes/obtenerClientePorIdController');
const obtenerClientesController = require('./clientes/obtenerClientesController');

module.exports = {
  calificarClienteController,
  crearClienteController,
  editarClienteController,
  suspender,
  reactivar,
  confirmarBaja,
  obtenerClientePorIdController,
  obtenerClientesController,
  buscarClientesController,
};
