const editarUsuario = require('./usuarios/editarUsuarioController');
const eliminarUsuario = require('./usuarios/eliminarUsuarioController');
const obtenerUsuario = require('./usuarios/obtenerUsuariosController');
const desactivarUsuario = require('./usuarios/desactivarUsuarioController');

module.exports = {
  editarUsuario,
  eliminarUsuario,
  obtenerUsuario, 
  desactivarUsuario,
};
