const editarUsuario = require('./usuarios/editarUsuarioController');
const eliminarUsuario = require('./usuarios/eliminarUsuarioController');
const obtenerUsuario = require('./usuarios/obtenerUsuariosController');
const cambiarEstadoActivo = require('./usuarios/cambiarEstadoActivo');
const actualizarRolUsuario = require('./usuarios/actualizarRolUsuario');
const cambiarPasswordController = require('./usuarios/cambiarPasswordController');

module.exports = {
  editarUsuario,
  eliminarUsuario,
  obtenerUsuario,
  cambiarEstadoActivo,
  actualizarRolUsuario,
  cambiarPasswordController,
};
