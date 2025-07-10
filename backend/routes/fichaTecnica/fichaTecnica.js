const express = require('express');
const router = express.Router();

const {
  crearFichaTecnica,
  obtenerFichaTecnica,
  editarFichaTecnica,
  eliminarFichaTecnica,
  suspenderFichaTecnica,
  reactivarFichaTecnica,
} = require('@controllers/fichaTecnicaController');
// Protecciones opcionales: verificarToken, verificarRol etc.

router.post('/', crearFichaTecnica);
router.get('/', obtenerFichaTecnica);
router.put('/:id', editarFichaTecnica);

// PATCH /api/ficha-tecnica-estado/:id/suspender
router.patch('/:id/suspender', suspenderFichaTecnica);

// PATCH /api/ficha-tecnica-estado/:id/reactivar
router.patch('/:id/reactivar', reactivarFichaTecnica);

// DELETE /api/ficha-tecnica-estado/:id
router.delete('/:id', eliminarFichaTecnica); // Soft delete

module.exports = router;
