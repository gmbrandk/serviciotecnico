// backend/routes/authRoutes.js

const express = require('express');
const { register, login, actualizarRolUsuario } = require('../controllers/authController');
const { roleAuth, verificarToken, verificarRolesPermitidos } = require('../middlewares/authMiddleware');
const { generarCodigoAcceso } = require('../controllers/codigoController');
const verificarCambioRolMiddleware = require('../middlewares/verificarCambioRolMiddleware');

const router = express.Router();

// ✅ Rutas públicas
router.post('/register', register);
router.post('/login', login);

// ✅ Ruta protegida por superAdministrador o administrador
router.post(
  '/generar-codigo',
  verificarToken,
  verificarRolesPermitidos(['superAdministrador', 'administrador']),
  generarCodigoAcceso
);

// ✅ Ruta para actualizar el rol de usuario
router.put(
  '/usuarios/:id/rol',
  verificarToken,
  verificarCambioRolMiddleware,
  actualizarRolUsuario
);

module.exports = router;
