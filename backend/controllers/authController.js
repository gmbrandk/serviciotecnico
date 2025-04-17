// backend/controllers/authController.js

const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registrar un nuevo usuario
const register = async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'Usuario ya registrado' });
    }

    // Crear nuevo usuario
    const usuario = new Usuario({ nombre, email, password });
    await usuario.save();
    res.status(201).json({ mensaje: 'Usuario registrado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al registrar usuario' });
  }
};

// Iniciar sesión de usuario
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar usuario por email
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Comparar la contraseña
    const esValida = await bcrypt.compare(password, usuario.password);
    if (!esValida) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    // Crear el token JWT
    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al iniciar sesión' });
  }
};

module.exports = { register, login };
