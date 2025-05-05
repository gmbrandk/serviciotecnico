const register = require('./auth/registerController');
const {login, logout} = require('./auth/loginController');
const actualizarRolUsuario = require('./auth/actualizarRolController');

module.exports = {
  register,
  login,
  logout,
  actualizarRolUsuario
};
