const express = require('express');
const router = express.Router();

const crearTipoDeTrabajoController = require('@controllers/tipoTrabajo/crearTipoTrabajoController');

// Crear un nuevo tipo de trabajo
router.post('/', crearTipoDeTrabajoController);

module.exports = router;
