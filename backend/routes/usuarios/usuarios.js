const express = require('express');
const { actualizarRolUsuario } = require('@controllers/authController');
const {
  editarUsuario,
  eliminarUsuario,
  cambiarEstadoActivo,
  obtenerUsuario,
  cambiarPasswordController,
} = require('@controllers/usuariosControllers');
const {
  verificarToken,
  verificarRolesPermitidos,
} = require('@middlewares/authMiddleware');
const verificarCambioRol = require('@middlewares/verificarCambioRolMiddleware');
const verificarEdicion = require('@middlewares/verificarEdicionMiddleware');
const verificarEliminacion = require('@middlewares/verificarEliminacionMiddleware');
const verificarCambioEstado = require('@middlewares/verificarCambioEstadoMiddleware');
const verificarEdicionMiddleware = require('@middlewares/verificarEdicionMiddleware');

const router = express.Router();

router.patch(
  '/editar/:id/rol',
  verificarToken,
  verificarCambioRol,
  actualizarRolUsuario
);

router.get(
  '/',
  verificarToken,
  verificarRolesPermitidos(['superadministrador', 'administrador']),
  obtenerUsuario
);

router.put('/editar/:id', verificarToken, verificarEdicion, editarUsuario);

router.post(
  '/editar/:id/cambiar-password',
  verificarToken,
  verificarEdicionMiddleware,
  cambiarPasswordController
);

// Ruta para cambiar el estado activo (activar/desactivar)
router.patch(
  '/:id/estado',
  verificarToken,
  verificarRolesPermitidos(['superadministrador', 'administrador']),
  verificarCambioEstado,
  cambiarEstadoActivo
);

router.delete(
  '/:id',
  verificarToken,
  verificarRolesPermitidos(['superadministrador', 'administrador']),
  verificarEliminacion,
  eliminarUsuario
);

module.exports = router;
