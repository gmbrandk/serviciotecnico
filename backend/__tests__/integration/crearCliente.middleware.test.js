// 📁 __tests__/integration/clientes.middleware.test.js
const request = require('supertest');
const app = require('../../app');
const Cliente = require('@models/Cliente');
const { conectarDB, desconectarDB, limpiarDB } = require('../setup');
const crearUsuarioYLogin = require('../helpers/crearUsuarioYLogin');
const Usuario = require('@models/Usuario');

let cookieAdmin;
let cookieTecnico;
let cookieInvitado;

beforeAll(async () => {
  await Usuario.deleteOne({ email: 'admin@mid.test' });
  await Usuario.deleteOne({ email: 'tecnico@mid.test' });
  await Usuario.deleteOne({ email: 'cliente@mid.test' });
  await Usuario.deleteOne({ email: 'superadmin@mid.test' });
  await conectarDB();
  const { cookie: c1 } = await crearUsuarioYLogin({
    nombre: 'Admin',
    email: 'admin@mid.test',
    password: '123456',
    role: 'administrador',
  });
  const { cookie: c2 } = await crearUsuarioYLogin({
    nombre: 'Tecnico',
    email: 'tecnico@mid.test',
    password: '123456',
    role: 'tecnico',
  });
  const { cookie: c3 } = await crearUsuarioYLogin({
    nombre: 'Cliente',
    email: 'cliente@mid.test',
    password: '123456',
    role: 'cliente', // ❌ No tiene permiso para crear clientes
  });

  const { cookie: c4 } = await crearUsuarioYLogin({
    nombre: 'Superadmin',
    email: 'superadmin@mid.test',
    password: '123456',
    role: 'superadministrador',
  });

  cookieAdmin = c1;
  cookieTecnico = c2;
  cookieInvitado = c3;
  cookieSuperadmin = c4;
});

afterAll(async () => {
  await limpiarDB();
  await desconectarDB();
});

beforeEach(async () => {
  await Cliente.deleteMany();
});

describe('🔐 Middleware - Seguridad y acceso en POST /api/clientes', () => {
  const endpoint = '/api/clientes';

  test('❌ Rechaza sin token (401)', async () => {
    const res = await request(app).post(endpoint).send({});
    expect(res.statusCode).toBe(401);
    expect(res.body.mensaje).toMatch(/not authenticated/i);
  });

  test('❌ Rechaza con rol no autorizado (403)', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Cookie', cookieInvitado)
      .send({});
    expect(res.statusCode).toBe(403);
    expect(res.body.mensaje).toMatch(/permiso/i);
  });

  test('❌ Rechaza con token válido pero body vacío', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Cookie', cookieTecnico)
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.mensaje).toMatch(/obligatorios/i);
  });

  test('✅ Acepta con rol permitido y datos válidos', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Cookie', cookieSuperadmin)
      .send({
        nombre: 'Cliente Prueba',
        dni: '11223388',
        telefono: '987654321',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.details.cliente.nombre).toBe('Cliente Prueba');
  });
});
