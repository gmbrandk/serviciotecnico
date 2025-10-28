const express = require('express');
const router = express.Router();

const crearTipoDeTrabajoController = require('@controllers/tipoTrabajo/crearTipoTrabajoController');
const listarTiposDeTrabajoController = require('@controllers/tipoTrabajo/listarTipoTrabajoController');
const auditarTiposDeTrabajoController = require('@controllers/tipoTrabajo/auditarTiposDeTrabajoController');

// Crear un nuevo tipo de trabajo
router.post('/', crearTipoDeTrabajoController);

// Obtener todos los tipos de trabajo (para el select o catálogo)
router.get('/', listarTiposDeTrabajoController);

// Obtener todos los tipos (modo auditoría)
router.get('/auditoria', auditarTiposDeTrabajoController);

module.exports = router;
