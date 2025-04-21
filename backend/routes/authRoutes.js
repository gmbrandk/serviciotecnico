// backend/routes/authRoutes.js
const express = require('express');
const { register, login } = require('../controllers/authController');
const { roleAuth, verificarToken, authMiddleware } = require('../middlewares/authMiddleware');
const { generarCodigoAcceso } = require('../controllers/codigoController');
const { actualizarRolUsuario } = require('../controllers/authController');

const router = express.Router();

// Rutas públicas
router.post('/register', register);
router.post('/login', login);

// Rutas protegidas por rol
/*router.post('/createSuperAdmin', auth, roleAuth('superAdministrador'), (req, res) => {
  // Lógica para crear un super administrador (solo accesible por superAdministrador)
  res.status(200).json({ mensaje: 'Super Administrador creado' });
});*/

// Solo accesible por superAdministrador
router.post('/generar-codigo', verificarToken, roleAuth('superAdministrador'), generarCodigoAcceso);

// Actualizar el rol de un usuario (requiere autenticación)
router.put('/usuarios/:id/rol', authMiddleware, actualizarRolUsuario);

module.exports = router;