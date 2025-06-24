// __tests__/routes/clientes.routes.test.js

const request = require('supertest');
const app = require('../../app');
const crearUsuarioYLogin = require('../helpers/crearUsuarioYLogin');
const Usuario = require('@models/Usuario');

let cookieAdmin;

beforeAll(async () => {
  await Usuario.deleteOne({ email: 'rutaadmin@test.com' });
  const { cookie } = await crearUsuarioYLogin({
    nombre: 'Ruta Admin',
    email: 'rutaadmin@test.com',
    password: '123456',
    role: 'administrador',
  });

  cookieAdmin = cookie;
});

describe('🛣️ Test de rutas /api/clientes', () => {
  test('🔐 Debe rechazar acceso a POST /api/clientes sin token', async () => {
    const res = await request(app).post('/api/clientes').send({});
    expect(res.statusCode).toBe(401); // No token
  });

  test('✅ Debe permitir acceso a POST /api/clientes con token válido', async () => {
    const res = await request(app)
      .post('/api/clientes')
      .set('Cookie', cookieAdmin)
      .send({
        nombre: 'Cliente Ruta',
        dni: '11111111',
        telefono: '999888777',
        email: 'ruta@cliente.com',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.cliente).toBeDefined();
  });

  test('✅ Crear cliente', async () => {
    const res = await request(app)
      .post('/api/clientes')
      .set('Cookie', cookieAdmin)
      .send({
        nombre: 'Juan Pérez',
        dni: '12345678',
        telefono: '987654321',
        email: 'juan@test.com',
      });

    console.log('📥 Status crear cliente:', res.statusCode);
    console.log('📥 Body crear cliente:', res.body);

    expect(res.statusCode).toBe(201);
    expect(res.body.cliente).toBeDefined();
  });

  test('🚫 Debe rechazar PATCH /api/clientes/:id/baja-definitiva a administrador', async () => {
    // Simulamos cliente
    const clienteRes = await request(app)
      .post('/api/clientes')
      .set('Cookie', cookieAdmin)
      .send({
        nombre: 'Cliente Ban',
        dni: '22222222',
        telefono: '999000111',
        email: 'ban@cliente.com',
      });

    const clienteId = clienteRes.body.cliente._id;

    const res = await request(app)
      .patch(`/api/clientes/${clienteId}/baja-definitiva`)
      .set('Cookie', cookieAdmin);

    expect(res.statusCode).toBe(403); // Admin no tiene permiso
    expect(res.body.mensaje).toMatch(/permiso/i);
  });
});
