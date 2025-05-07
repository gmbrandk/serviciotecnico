const express = require('express');
const { verificarToken } = require('@middlewares/authMiddleware');
const router = express.Router();

router.get('/me', verificarToken, (req, res) => {
  const { _id, nombre, email, role } = req.usuario;

  res.status(200).json({
    success: true,
    mensaje: 'Usuario autenticado',
    usuario: { _id, nombre, email, role }
  });
});

module.exports = router;
