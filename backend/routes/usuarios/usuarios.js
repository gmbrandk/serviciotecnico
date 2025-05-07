const express = require('express');
const {actualizarRolUsuario} = require('@controllers/authController');
const {editarUsuario, eliminarUsuario, obtenerUsuarios} = require('@controllers/usuariosControllers');
const { verificarToken, verificarRolesPermitidos } = require('@middlewares/authMiddleware');
const verificarCambioRol = require('@middlewares/verificarCambioRolMiddleware');
const verificarEdicion = require('@middlewares/verificarEdicionMiddleware');
const verificarEliminacion = require('@middlewares/verificarEliminacionMiddleware');

const router = express.Router();

router.put(
  '/:id/rol',
  verificarToken,
  verificarCambioRol,
  actualizarRolUsuario
);

router.get(
  '/', 
  verificarToken, 
  verificarRolesPermitidos(['superadministrador', 'administrador']),
  obtenerUsuarios);

router.put(
  '/:id',
  verificarToken,
  verificarRolesPermitidos(['superadministrador', 'administrador']),
  verificarEdicion,
  editarUsuario
);

router.delete(
  '/:id',
  verificarToken,
  verificarRolesPermitidos(['superadministrador', 'administrador']),
  verificarEliminacion,
  eliminarUsuario
);

module.exports = router;
