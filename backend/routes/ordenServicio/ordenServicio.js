// routes/ordenServicio.js
const express = require('express');
const router = express.Router();
const {
  crearOrdenServicioController,
  obtenerOrdenServicioController,
  actualizarOrdenServicioController,
  anularOrdenServicioController,
} = require('@controllers/osController');

router.post('/', crearOrdenServicioController);

// Obtener todas o por ID
router.get('/', obtenerOrdenServicioController); // Si usas query params
router.get('/:id', obtenerOrdenServicioController);

// Actualizar
router.put('/:id', actualizarOrdenServicioController);

router.patch('/:id/anular', anularOrdenServicioController);

module.exports = router;
