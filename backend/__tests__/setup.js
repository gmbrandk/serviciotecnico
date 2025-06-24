const mongoose = require('mongoose');
require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
});

const mongoURI = process.env.MONGODB_URI_TEST;

// ✅ Conexión a MongoDB
const conectarDB = async () => {
  if (!mongoURI) throw new Error('❌ No se encontró la URI de test');
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoURI);
    console.log('🧪 Conectado a MongoDB de test');
  }
};

// ✅ Limpia todas las colecciones antes de cada test
const limpiarDB = async () => {
  if (mongoose.connection.readyState !== 1) {
    console.warn('⚠️ No hay conexión activa, se omite limpieza');
    return;
  }

  const collections = mongoose.connection.collections;
  for (const key in collections) {
    if (key === 'usuarios') continue; // ❗ Evita borrar usuarios base
    await collections[key].deleteMany();
  }

  console.log('🧼 Base de datos limpiada');
};

// ✅ Cierra la conexión después de todas las pruebas
const desconectarDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log('🛑 Conexión a MongoDB cerrada');
  }
};

// 🔁 Hooks de Jest
beforeAll(async () => {
  try {
    await conectarDB();
  } catch (err) {
    console.error('❌ Error al conectar DB:', err);
  }
});

beforeEach(async () => {
  try {
    await limpiarDB();
  } catch (err) {
    console.error('❌ Error al limpiar DB:', err);
  }
});

afterAll(async () => {
  try {
    await desconectarDB();
  } catch (err) {
    console.error('❌ Error en afterAll:', err);
  }
});

// 🧪 Exportable por si lo usas desde helpers externos
module.exports = {
  conectarDB,
  limpiarDB,
  desconectarDB,
};
