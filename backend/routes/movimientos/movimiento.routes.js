const express = require('express');
const {
  verificarToken,
  verificarRolesPermitidos,
} = require('@middlewares/authMiddleware');
const { obtenerMovimiento } = require('@controllers/movimientoController');
const verificarAcceso = require('@middlewares/verificarAcceso');

const router = express.Router();

router.get(
  '/',
  verificarToken,
  verificarAcceso({
    accion: 'obtenerMovimiento',
    rolesPermitidos: ['superadministrador', 'administrador'],
  }),
  obtenerMovimiento
);

module.exports = router;
