require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('@models/Usuario');
const conectarDB = require('../config/db');

const crearSuperAdmin = async () => {
  try {
    await conectarDB();

    const { SUPER_ADMIN_ACCESS_CODE } = process.env;

    const nombre = 'superadmin';
    const email = 'superadmin@example.com';
    const password = 'admin123'; // Puedes cambiarlo
    const role = 'superadministrador';
    const accessCode = SUPER_ADMIN_ACCESS_CODE;

    // Verifica si ya existe
    const existente = await Usuario.findOne({ email });
    if (existente) {
      console.log('⚠️  Ya existe un superadministrador con ese email.');
      return process.exit(0);
    }

    const nuevoUsuario = new Usuario({
      nombre,
      email,
      password,
      role,
      accessCode,
    });

    await nuevoUsuario.save();
    console.log('✅ Superadministrador creado con éxito.');
  } catch (error) {
    console.error('❌ Error al crear superadministrador:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

crearSuperAdmin();
