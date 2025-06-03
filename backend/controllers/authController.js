const register = require('./auth/registerController');
const { login, logout } = require('./auth/authController');

module.exports = {
  register,
  login,
  logout,
};
