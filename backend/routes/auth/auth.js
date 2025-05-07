const express = require('express');

const { register, login, logout } = require('@controllers/authController');
const meRoute = require('./me');
const validarRegistro = require('@middlewares/validators/validateRegister');
const manejarErroresValidacion = require('@middlewares/validators/manejarErroresValidacion');

const router = express.Router();

// orden: [validadores] → [manejo de errores] → [controlador]
router.post('/register', validarRegistro, manejarErroresValidacion, register);

router.post('/login', login);
// Ruta para cerrar sesión
router.post('/logout', logout);
router.use(meRoute);

module.exports = router;
