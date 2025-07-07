// __tests__/helpers/crearClienteTest.js
const request = require('supertest');
const app = require('app');

/**
 * 🧪 Crea un cliente válido mediante la API real.
 * @param {string} cookie - Cookie de autenticación.
 * @param {Object} overrides - Campos personalizados para el cliente.
 * @returns {Promise<Object>} Cliente creado (res.body.details.cliente)
 */
const crearClienteTest = async (cookie, overrides = {}) => {
  const clienteBase = {
    nombre: `Cliente Test ${Date.now()}`,
    dni: `DNI${Math.floor(Math.random() * 100000)}`,
    telefono: `9${Math.floor(10000000 + Math.random() * 90000000)}`,
    email: `cliente${Math.floor(Math.random() * 10000)}@test.com`,
    ...overrides,
  };

  const res = await request(app)
    .post('/api/clientes')
    .set('Cookie', cookie)
    .send(clienteBase);

  if (res.statusCode !== 201) {
    throw new Error(`❌ Error al crear cliente: ${res.body?.mensaje}`);
  }

  return res.body.details.cliente;
};

module.exports = crearClienteTest;
