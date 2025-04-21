const express = require('express');
const router = express.Router();
const { generarCodigoAcceso } = require('../controllers/codigoController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Solo accesible para superAdministrador
router.post('/generar-codigo', verificarToken, generarCodigoAcceso);

module.exports = router;
