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
const verificarAcceso = require('../../middlewares/verificarAcceso');

const router = express.Router();

// Ruta POST para generar código
router.post(
  '/generar',
  verificarToken, // ✅ Primero: verificar que el usuario esté autenticado
  verificarAcceso({
    accion: 'generarCodigo',
    rolesPermitidos: ['superadministrador', 'administrador'],
  }),
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
