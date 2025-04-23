const express = require('express');
const { generarCodigoAcceso } = require('../controllers/codigoController');
const { verificarToken, verificarRolesPermitidos } = require('../middlewares/authMiddleware');
const router = express.Router();

// Sólo Admin y SuperAdmin
router.post(
  '/generar',
  verificarToken,
  verificarRolesPermitidos(['superadministrador', 'administrador']),
  generarCodigoAcceso
);

module.exports = router;
