const mongoose = require('mongoose');

require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
});

// ✅ Conexión a MongoDB de pruebas
const conectarDB = async () => {
  const mongoURI = process.env.MONGODB_URI_TEST;
  if (!mongoURI) throw new Error('❌ No se encontró la URI de test');

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoURI);
    console.log('🧪 Conectado a MongoDB de test');
  }
};

// ✅ Limpia todas las colecciones entre pruebas
// setup.js o archivo similar
const limpiarDB = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    if (key === 'usuarios') continue; // 🔁 Evita borrar usuarios
    await collections[key].deleteMany();
  }

  console.log('🧼 Base de datos limpiada');
};

// ✅ Cierra la conexión después de las pruebas
const desconectarDB = async () => {
  await mongoose.connection.close();
  console.log('🛑 Conexión a MongoDB cerrada');
};

// 👉 Ejecuta en Jest
beforeAll(conectarDB);
afterEach(limpiarDB);
afterAll(desconectarDB);

module.exports = {
  conectarDB,
  limpiarDB,
  desconectarDB,
};
