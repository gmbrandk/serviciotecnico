const express = require('express');
const router = express.Router();
const {
  editarUsuario,
  eliminarUsuario,
  cambiarEstadoActivo,
  obtenerUsuario,
  cambiarPasswordController,
  actualizarRolUsuario,
} = require('@controllers/usuariosControllers');
const {
  verificarToken,
  verificarRolesPermitidos,
} = require('@middlewares/authMiddleware');
const verificarEdicion = require('@middlewares/verificarEdicionMiddleware');
const verificarEliminacion = require('@middlewares/verificarEliminacionMiddleware');
const verificarEdicionMiddleware = require('@middlewares/verificarEdicionMiddleware');
const verificarAcceso = require('@middlewares/verificarAcceso');

router.patch(
  '/editar/:id/rol',
  verificarToken, // ✅ Primero: verificar que el usuario esté autenticado
  verificarAcceso({
    accion: 'cambiarRol',
    requiereUsuarioObjetivo: true,
    obtenerNuevoRol: (req) => req.body.nuevoRol,
  }),
  actualizarRolUsuario
);

router.get(
  '/',
  verificarToken,
  verificarAcceso({
    accion: 'obtenerUsuario',
    rolesPermitidos: ['superadministrador', 'administrador'],
  }),
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
  verificarAcceso({
    accion: 'cambiarEstado',
    requiereUsuarioObjetivo: true,
    rolesPermitidos: ['superadministrador', 'administrador'],
    requiereUsuarioObjetivo: true, // ✅ Activar esto
  }),
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
