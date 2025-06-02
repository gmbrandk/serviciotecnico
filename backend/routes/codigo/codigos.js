// backend/routes/codigos.js
const express = require('express');
const router = express.Router();
const {
  generarCodigoAcceso,
  obtenerCodigos,
} = require('@controllers/codigoController');
const { verificarToken } = require('@middlewares/authMiddleware');
const verificarAcceso = require('@middlewares/verificarAcceso');

// Ruta POST para generar código
router.post(
  '/generar',
  verificarToken, // ✅ Primero: verificar que el usuario esté autenticado
  verificarAcceso({
    accion: 'generarCodigo',
    rolesPermitidos: ['superadministrador', 'administrador'],
  }),
  generarCodigoAcceso // ✅ Finalmente: controlador que llama al service
);
router.get(
  '/',
  verificarToken,
  verificarAcceso({
    accion: 'generarCodigo',
    rolesPermitidos: ['superadministrador', 'administrador'],
  }),
  obtenerCodigos
);

module.exports = router;
