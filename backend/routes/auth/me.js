const express = require('express');
const { verificarToken } = require('@middlewares/authMiddleware');
const router = express.Router();

router.get('/me', verificarToken, (req, res) => {
  console.log('[Route /me] ✅ Token verificado. Usuario en req:', req.usuario);

  const { _id, nombre, email, role } = req.usuario;
  res.json({ _id, nombre, email, role });
});

module.exports = router;
