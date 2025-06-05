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
const verificarEliminacion = require('@middlewares/verificarEliminacionMiddleware');
const verificarAcceso = require('@middlewares/verificarAcceso');

router.patch(
  '/editar/:id/rol',
  verificarToken, // ✅ Primero: verificar que el usuario esté autenticado
  verificarAcceso({
    accion: 'cambiarRolUsuario',
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

router.put(
  '/editar/:id',
  verificarToken,
  verificarAcceso({
    accion: 'editarUsuario',
    rolesPermitidos: ['superadministrador', 'administrador', 'tecnico'],
    requiereUsuarioObjetivo: true,
  }),
  editarUsuario
);

router.post(
  '/editar/:id/cambiar-password',
  verificarToken,
  verificarAcceso({
    accion: 'editarUsuario',
    rolesPermitidos: ['superadministrador', 'administrador', 'tecnico'],
    requiereUsuarioObjetivo: true,
  }),
  cambiarPasswordController
);

// Ruta para cambiar el estado activo (activar/desactivar)
router.patch(
  '/editar/:id/estado',
  verificarToken,
  verificarAcceso({
    accion: 'cambiarEstado',
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
