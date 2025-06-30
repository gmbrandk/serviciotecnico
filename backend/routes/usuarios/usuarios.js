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
const { verificarToken } = require('@middlewares/authMiddleware');
const verificarAcceso = require('@middlewares/verificarAcceso');

router.patch(
  '/editar/:id/rol',
  verificarToken, // ✅ Primero: verificar que el usuario esté autenticado
  verificarAcceso({
    accion: 'cambiarRolUsuario',
    rolesPermitidos: ['superadministrador', 'administrador'],
    requiereUsuarioObjetivo: true,
    obtenerNuevoRol: (req) => req.body.nuevoRol,
  }),
  actualizarRolUsuario
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

router.delete(
  '/:id',
  verificarToken,
  verificarAcceso({
    accion: 'eliminar',
    rolesPermitidos: ['superadministrador', 'administrador', 'tecnico'],
    requiereUsuarioObjetivo: true,
  }),
  eliminarUsuario
);

module.exports = router;
