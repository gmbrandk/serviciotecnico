// backend/controllers/authController.js
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const CodigoAcceso = require('../models/CodigoAcceso');

// Registrar un nuevo usuario
const register = async (req, res) => {
  const { nombre, email, password, role, accessCode, codigoAcceso } = req.body;

  try {
    // Si el role es 'superAdministrador', verificar que el código de acceso sea correcto
    if (role === 'superAdministrador' && accessCode !== process.env.SUPER_ADMIN_ACCESS_CODE) {
      return res.status(403).json({ mensaje: 'Código de acceso inválido para superAdministrador.' });
    }
    
    const codigoValido = await CodigoAcceso.findOne({ codigo: codigoAcceso });
    if(!codigoValido || codigoValido.usosDisponibles < 1){
      return res.status(403).json({ error : 'Codigo de acceso invalido o sin usos disponibles '});
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'Usuario ya registrado' });
    }

    // Crear nuevo usuario
    const usuario = new Usuario({ nombre, email, password, role, accessCode: role === 'superAdministrador' ? accessCode : undefined });
    await usuario.save();

    codigoValido.usosDisponibles -= 1;
    if(codigoValido.usosDisponibles <= 0){
      await CodigoAcceso.deleteOne({ _id: codigoValido._id })
    } else {
      await codigoValido.save();
    }

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
      return res.status(404).json({ success: false, mensaje: 'Usuario no encontrado' });
    }

    // Comparar la contraseña
    const esValida = await bcrypt.compare(password, usuario.password);
    if (!esValida) {
      return res.status(401).json({ success: false, mensaje: 'Contraseña incorrecta' });
    }

    // Crear el token JWT
    const token = jwt.sign(
      { id: usuario._id, email: usuario.email, role: usuario.role }, // Incluimos el role en el payload
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      success: true,
      token,
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        role: usuario.role,  // Incluimos el role en la respuesta
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al iniciar sesión' });
  }
};

const actualizarRolUsuario = async (req, res) => {
  const usuarioObjetivo = req.usuarioObjetivo;
  const { nuevoRol } = req.body;

  try {
    usuarioObjetivo.role = nuevoRol.toLowerCase();
    await usuarioObjetivo.save();

    res.json({ mensaje: `Rol actualizado a ${nuevoRol.toLowerCase()} exitosamente.` });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar el rol.' });
  }
};


module.exports = {
  register,
  login,
  actualizarRolUsuario
};

