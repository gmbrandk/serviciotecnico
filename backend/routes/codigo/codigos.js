// backend/routes/codigos.js
const express = require('express');
const { generarCodigoAcceso, obtenerCodigos } = require('@controllers/codigoController');
const { verificarToken, verificarRolesPermitidos } = require('@middlewares/authMiddleware');
const validarCreacionCodigo = require('@middlewares/validarCreacionCodigoMiddleware');

const router = express.Router();

// Ruta POST para generar código
router.post(
  '/generar',
  validarCreacionCodigo,
  verificarToken,
  verificarRolesPermitidos(['superadministrador', 'administrador']),
  generarCodigoAcceso
);

module.exports = router;
