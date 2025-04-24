const express = require('express');
const {actualizarRolUsuario} = require('@controllers/authController');
const editarUsuario = require('@controllers/editarUsuarioController');
const eliminarUsuario = require('@controllers/eliminarUsuarioController');
const { verificarToken } = require('@middlewares/authMiddleware');
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

router.put(
  '/:id',
  verificarToken,
  verificarEdicion,
  editarUsuario
);

router.delete(
  '/:id',
  verificarToken,
  verificarEliminacion,
  eliminarUsuario
);

module.exports = router;
