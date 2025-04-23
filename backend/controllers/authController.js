const register = require('./auth/registerController');
const login = require('./auth/loginController');
const actualizarRolUsuario = require('./auth/actualizarRolController');

module.exports = {
  register,
  login,
  actualizarRolUsuario
};
