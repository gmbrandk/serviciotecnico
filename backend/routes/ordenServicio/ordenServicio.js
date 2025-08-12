const express = require('express');
const router = express.Router();
const {
  crearOrdenServicioController,
  obtenerOrdenServicioController,
  actualizarOrdenServicioController,
  anularOrdenServicioController,
} = require('@controllers/osController');
const { verificarToken } = require('@middlewares/authMiddleware');

// Crear orden (requiere autenticación si quieres registrar usuario)
router.post('/', verificarToken, crearOrdenServicioController);

// Obtener todas o por ID
router.get('/', verificarToken, obtenerOrdenServicioController);
router.get('/:id', verificarToken, obtenerOrdenServicioController);

// Actualizar
router.put('/:id', verificarToken, actualizarOrdenServicioController);

// Anular (requiere autenticación para registrar movimiento con usuarioId)
router.patch('/:id/anular', verificarToken, anularOrdenServicioController);

module.exports = router;
