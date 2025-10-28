const express = require('express');
const router = express.Router();

const {
  calificarClienteController,
  crearClienteController,
  editarClienteController,
  suspender,
  reactivar,
  confirmarBaja,
  obtenerClientePorIdController,
  obtenerClientesController,
  buscarClientesController,
} = require('@controllers/clientesController');
const { verificarToken } = require('@middlewares/authMiddleware');
const verificarAcceso = require('@middlewares/verificarAcceso');
const { sugerirEmails } = require('@controllers/email.controller');

router.get(
  '/search',
  verificarToken,
  verificarAcceso({
    accion: 'cliente:buscar',
    rolesPermitidos: ['tecnico', 'administrador', 'superadministrador'],
  }),
  buscarClientesController
);

// ✅ Obtener todos los clientes (con filtros opcionales)
router.get('/', obtenerClientesController);

// ✅ Obtener cliente por ID
router.get('/:id', obtenerClientePorIdController);

// ✅ Crear cliente
router.post(
  '/',
  verificarToken, // ✅ Asegura que sea un usuario del sistema
  verificarAcceso({
    accion: 'cliente:crear',
    rolesPermitidos: ['tecnico', 'administrador', 'superadministrador'],
  }),
  crearClienteController
);

// ✅ Editar cliente
router.put(
  '/:id',
  verificarToken,
  verificarAcceso({
    accion: 'cliente:editar',
    rolesPermitidos: ['tecnico', 'administrador', 'superadministrador'],
  }),
  editarClienteController
);

// ✅ Suspender temporalmente
router.patch(
  '/:id/suspender',
  verificarToken,
  verificarAcceso({
    accion: 'cliente:suspender',
    rolesPermitidos: ['tecnico', 'administrador', 'superadministrador'],
  }),
  suspender
);

// ✅ Reactivar cliente
router.patch(
  '/:id/reactivar',
  verificarToken,
  verificarAcceso({
    accion: 'cliente:reactivar',
    rolesPermitidos: ['tecnico', 'administrador', 'superadministrador'],
  }),
  reactivar
);

// ✅ Confirmar baja definitiva (ban)
router.patch(
  '/:id/baja-definitiva',
  verificarToken,
  verificarAcceso({
    accion: 'cliente:baja_definitiva',
    rolesPermitidos: ['superadministrador'],
  }),
  confirmarBaja
);

// ✅ Calificar cliente automáticamente según OS
router.put(
  '/:id/calificar',
  verificarToken,
  verificarAcceso({
    accion: 'cliente:calificar',
    rolesPermitidos: ['administrador', 'superadministrador'],
  }),
  calificarClienteController
);

// POST /api/generar-emails
router.post('/generar-emails', sugerirEmails);

module.exports = router;
