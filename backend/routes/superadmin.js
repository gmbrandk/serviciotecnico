const express = require('express');
const router = express.Router();

const crearSuperAdmin = require('../controllers/superAdminController');
const { verificarToken, verificarRolesPermitidos } = require('../middlewares/authMiddleware');

router.post(
  '/crear-superadmin',
  verificarToken,
  verificarRolesPermitidos(['superadministrador']),
  crearSuperAdmin
);

module.exports = router;
