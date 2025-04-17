// routes/protectedRoutes.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');

router.get('/perfil', authenticateToken, (req, res) => {
  res.json({ message: 'Perfil del técnico', user: req.user });
});

module.exports = router;
