const express = require('express');
const router = express.Router();

const crearEquipoController = require('@controllers/equipos/crearEquipoController');
const { verificarToken } = require('@middlewares/authMiddleware');
const verificarAcceso = require('@middlewares/verificarAcceso');

router.post(
  '/',
  verificarToken,
  verificarAcceso({
    accion: 'equipo:crear',
    requiereClienteObjetivo: true,
    rolesPermitidos: ['tecnico', 'administrador', 'superadministrador'],
  }),
  crearEquipoController
);

module.exports = router;
