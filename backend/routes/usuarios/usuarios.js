const express = require('express');
const {actualizarRolUsuario} = require('@controllers/authController');
const {editarUsuario, eliminarUsuario, desactivarUsuario, obtenerUsuario} = require('@controllers/usuariosControllers');
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

// Ruta para desactivar un usuario
router.put(
  '/desactivar/:id', 
  verificarToken,
  verificarRolesPermitidos(['superadministrador','administrador']),
  desactivarUsuario);

router.get(
  '/', 
  verificarToken, 
  verificarRolesPermitidos(['superadministrador', 'administrador']),
  obtenerUsuario);

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
