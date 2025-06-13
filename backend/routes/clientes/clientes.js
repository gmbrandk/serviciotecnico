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
} = require('@controllers/clientesController');

// 👉 Aquí defines el endpoint esperado
router.put('/calificar/:id', calificarClienteController);

router.post('/crear', crearClienteController);
router.post('/editar/:id', editarClienteController);

// PATCH: Suspender cliente
router.patch('/suspender/:id', suspender);

// PATCH: Reactivar cliente
router.patch('/reactivar/:id', reactivar);

// PATCH: Confirmar baja definitiva
router.patch('/confirmar-baja/:id', confirmarBaja);
module.exports = router;
