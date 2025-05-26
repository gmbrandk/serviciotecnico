// backend/routes/codigos.js
const express = require('express');
const {
  generarCodigoAcceso,
  obtenerCodigos,
} = require('@controllers/codigoController');
const {
  verificarToken,
  verificarRolesPermitidos,
} = require('@middlewares/authMiddleware');
const validarCreacionCodigo = require('@middlewares/validarCreacionCodigoMiddleware');

const router = express.Router();

// Ruta POST para generar código
router.post(
  '/generar',
  verificarToken, // ✅ Primero: verificar que el usuario esté autenticado
  verificarRolesPermitidos(['superadministrador', 'administrador']), // ✅ Segundo: validar que su rol tenga permiso
  validarCreacionCodigo, // ✅ Tercero: validar campos del body (si aplica)
  generarCodigoAcceso // ✅ Finalmente: controlador que llama al service
);
router.get(
  '/',
  verificarToken,
  verificarRolesPermitidos(['superadministrador', 'administrador']),
  obtenerCodigos
);

module.exports = router;
