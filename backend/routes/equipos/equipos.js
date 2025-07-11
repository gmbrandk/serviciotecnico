const express = require('express');
const router = express.Router();

const crearEquipoController = require('@controllers/equipos/crearEquipoController');
const editarEquipoController = require('@controllers/equipos/editarEquipoController');
const { verificarToken } = require('@middlewares/authMiddleware');
const verificarAcceso = require('@middlewares/verificarAcceso');
const obtenerEquiposController = require('@controllers/equipos/obtenerEquipoController');
const obtenerEquipoPorIdController = require('@controllers/equipos/obtenerEquipoPorIdController');

router.get(
  '/',
  verificarToken,
  verificarAcceso({
    accion: 'equipo:obtener',
    rolesPermitidos: ['tecnico', 'administrador', 'superadministrador'],
  }),
  obtenerEquiposController
);

// 🔍 Obtener equipo por ID
router.get(
  '/:id',
  verificarToken,
  verificarAcceso({
    accion: 'equipo:obtener',
    rolesPermitidos: ['tecnico', 'administrador', 'superadministrador'],
  }),
  obtenerEquipoPorIdController
);

// ✅ Crear equipo
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

// ✅ Editar equipo
router.put(
  '/:id',
  verificarToken,
  verificarAcceso({
    accion: 'equipo:editar',
    requiereClienteObjetivo: true,
    rolesPermitidos: ['tecnico', 'administrador', 'superadministrador'],
  }),
  editarEquipoController
);

module.exports = router;
