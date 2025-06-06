const express = require('express');
const router = express.Router();
const calificarClienteController = require('@controllers/clientes/calificarController');

// 👉 Aquí defines el endpoint esperado
router.put('/calificar/:id', calificarClienteController);

module.exports = router;
