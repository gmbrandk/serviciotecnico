const register = require('./auth/registerController');
const {login, logout} = require('./auth/loginController');
const actualizarRolUsuario = require('./usuarios/actualizarRolUsuario');

module.exports = {
  register,
  login,
  logout,
  actualizarRolUsuario
};
