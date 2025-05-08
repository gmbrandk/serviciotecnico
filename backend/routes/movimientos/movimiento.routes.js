const express = require('express');
const { verificarToken, verificarRolesPermitidos } = require('@middlewares/authMiddleware');
const { obtenerMovimiento } = require('@controllers/movimientoController');

const router = express.Router();

router.get(
    '/',
    verificarToken,
    verificarRolesPermitidos(['superadministrador', 'administrador']),
    obtenerMovimiento
  );
  

module.exports =  router;
