const express = require('express');
const { register, login, logout } = require('@controllers/authController');
const meRoute = require('./me');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
// Ruta para cerrar sesión
router.post('/logout', logout);
router.use(meRoute);

module.exports = router;
