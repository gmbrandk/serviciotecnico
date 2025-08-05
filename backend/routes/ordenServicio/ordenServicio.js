// routes/ordenServicio.js
const express = require('express');
const router = express.Router();
const crearOrdenServicioController = require('@controllers/ordenServicio/crearOrdenServicioController');

router.post('/', crearOrdenServicioController);

module.exports = router;
