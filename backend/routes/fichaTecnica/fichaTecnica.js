const express = require('express');
const router = express.Router();
const crearFichaTecnica = require('@controllers/fichaTecnica/crearFichaTecnica');
const obtenerFichaTecnica = require('@controllers/fichaTecnica/obtenerFichaTecnica');
const editarFichaTecnica = require('@controllers/fichaTecnica/editarFichaTecnica');
const eliminarFichaTecnica = require('@controllers/fichaTecnica/eliminarFichaTecnica');

// Protecciones opcionales: verificarToken, verificarRol etc.

router.post('/', crearFichaTecnica);
router.get('/', obtenerFichaTecnica);
router.put('/:id', editarFichaTecnica);
router.delete('/:id', eliminarFichaTecnica);

module.exports = router;
