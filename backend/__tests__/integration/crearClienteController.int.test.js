// 📁 __tests__/integration/crearClienteController.int.test.js
const request = require('supertest');
const app = require('../../app');
const Cliente = require('@models/Cliente');
const { conectarDB, desconectarDB, limpiarDB } = require('../setup');
const crearUsuarioYLogin = require('../helpers/crearUsuarioYLogin');
const Usuario = require('@models/Usuario');

let cookieAdmin;

beforeAll(async () => {
  await Usuario.deleteOne({ email: 'admin@test.com' });
  await conectarDB();
  const { cookie } = await crearUsuarioYLogin({
    nombre: 'Admin',
    email: 'admin@test.com',
    password: '123456',
    role: 'administrador',
  });
  cookieAdmin = cookie;
});

afterAll(async () => {
  await limpiarDB();
  await desconectarDB();
});

beforeEach(async () => {
  await Cliente.deleteMany();
});

describe('🧪 Integración - Crear Cliente (con validación telefónica)', () => {
  const endpoint = '/api/clientes';

  test('✅ Crea cliente con teléfono peruano sin prefijo', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Cookie', cookieAdmin)
      .send({
        nombre: 'Carlos Test',
        dni: '99887766',
        telefono: '987654321',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.details.cliente.telefono).toBe('+51987654321');
  });

  test('✅ Crea cliente con prefijo +56 (Chile)', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Cookie', cookieAdmin)
      .send({
        nombre: 'Juan Chile',
        dni: '77665544',
        telefono: '+56987654321',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.details.cliente.telefono).toBe('+56987654321');
  });

  test('❌ Teléfono con longitud incorrecta según país', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Cookie', cookieAdmin)
      .send({
        nombre: 'Error Length',
        dni: '11223344',
        telefono: '+5491234',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.mensaje).toMatch(/debe tener/);
  });

  test('❌ Teléfono con prefijo inválido', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Cookie', cookieAdmin)
      .send({
        nombre: 'Error Prefijo',
        dni: '55667788',
        telefono: '+99912345678',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.mensaje).toMatch(/no reconocido/);
  });
});
