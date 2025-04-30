// __test__/setup.js
const mongoose = require('mongoose');

if (process.env.NODE_ENV === 'test') {
  require('dotenv').config({ path: '.env.test' });
} else {
  require('dotenv').config();
}

beforeAll(async () => {
  // Conectar a la base de datos de pruebas (MongoDB)
  const mongoURI = process.env.MONGODB_URI_TEST; // Este es el URI para la base de datos de pruebas
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoURI);
  }
});

describe('Dummy test', () => {
  it('should run without issues', () => {
    expect(true).toBe(true);
  });
});

afterAll(async () => {
  // Cerrar la conexión después de todas las pruebas
  await mongoose.connection.close();
});

