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

// Ruta GET para obtener los códigos
router.get(
  '/',
  verificarToken,
  verificarRolesPermitidos(['superadministrador', 'administrador']),
  obtenerCodigos
);

module.exports = router;
