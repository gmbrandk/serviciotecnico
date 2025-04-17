// crearUsuario.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Usuario from '../models/Usuario.js'; // Ajusta esta ruta si está en otra carpeta

dotenv.config();

async function crearUsuario() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const contraseñaHasheada = await bcrypt.hash('admin123', 10);

    const nuevoUsuario = new Usuario({
      correo: 'admin@demo.com',
      contraseña: contraseñaHasheada
    });

    await nuevoUsuario.save();
    console.log('✅ Usuario creado exitosamente');
  } catch (error) {
    console.error('❌ Error al crear el usuario:', error);
  } finally {
    mongoose.disconnect();
  }
}

crearUsuario();
