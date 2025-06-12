const express = require('express');
const router = express.Router();
const calificarClienteController = require('@controllers/clientes/calificarController');
const crearClienteController = require('@controllers/clientes/crearClienteController');

const estadoClienteController = require('@controllers/clientes/estadoClienteController');
const editarClienteController = require('@controllers/clientes/editarClienteController');

// 👉 Aquí defines el endpoint esperado
router.put('/calificar/:id', calificarClienteController);

router.post('/crear', crearClienteController);
router.post('/editar/:id', editarClienteController);

// PATCH: Suspender cliente
router.patch('/suspender/:id', estadoClienteController.suspender);

// PATCH: Reactivar cliente
router.patch('/reactivar/:id', estadoClienteController.reactivar);

// PATCH: Confirmar baja definitiva
router.patch('/confirmar-baja/:id', estadoClienteController.confirmarBaja);
module.exports = router;
