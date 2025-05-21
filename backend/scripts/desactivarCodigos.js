// desactivarCodigos.js
require('dotenv').config(); // Asegúrate de tener tu .env con MONGODB_URI
const mongoose = require('mongoose');
const CodigoAcceso = require('../models/CodigoAcceso'); // Ajusta según tu estructura

async function desactivarTodosLosCodigos() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const resultado = await CodigoAcceso.updateMany(
      { estado: 'activo' }, // opcional: solo los activos
      {
        $set: {
          usosDisponibles: 0,
          estado: 'inactivo',
        },
      }
    );

    console.log(`✅ Codigos desactivados: ${resultado.modifiedCount}`);
  } catch (error) {
    console.error('❌ Error al actualizar códigos:', error);
  } finally {
    mongoose.disconnect();
  }
}

desactivarTodosLosCodigos();
