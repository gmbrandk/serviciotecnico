const request = require('supertest');
const app = require('../../app');
const Cliente = require('@models/Cliente');
const { conectarDB, desconectarDB, limpiarDB } = require('../setup');
const crearUsuarioYLogin = require('../helpers/crearUsuarioYLogin');
const Usuario = require('@models/Usuario');

let cookieAdmin;

beforeAll(async () => {
  await Usuario.deleteOne({ email: 'admin@crear.com' });
  await conectarDB();
  const { cookie } = await crearUsuarioYLogin({
    nombre: 'Admin',
    email: 'admin@crear.com',
    password: '123456',
    role: 'administrador',
  });
  cookieAdmin = cookie;
});

afterAll(async () => {
  await limpiarDB();
  await desconectarDB();
});

describe('🧪 Validaciones - Crear Cliente', () => {
  beforeEach(async () => {
    await Cliente.deleteMany({});
  });
  const endpoint = '/api/clientes';

  test('✅ Cliente creado correctamente', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Cookie', cookieAdmin)
      .send({
        nombre: 'Juan Pérez',
        dni: '12345678',
        telefono: '999999999',
        email: 'juan@test.com',
      });

    console.log(res.body); // 👈 agrega esto temporalmente

    expect(res.statusCode).toBe(201);
    expect(res.body?.details?.cliente?.nombre).toBe('Juan Pérez');
  });

  test('❌ Faltan campos obligatorios', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Cookie', cookieAdmin)
      .send({ nombre: '', dni: '', telefono: '' });

    expect(res.statusCode).toBe(400);
    expect(res.body.mensaje).toMatch(/obligatorios/i);
  });

  test('❌ DNI duplicado', async () => {
    await Cliente.create({ nombre: 'X', dni: '9999', telefono: '999999999' });

    const res = await request(app)
      .post(endpoint)
      .set('Cookie', cookieAdmin)
      .send({ nombre: 'Y', dni: '9999', telefono: '999999999' });

    expect(res.statusCode).toBe(400);
    expect(res.body.mensaje).toMatch(/DNI/);
  });

  test('❌ Email inválido', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Cookie', cookieAdmin)
      .send({
        nombre: 'X',
        dni: '123',
        telefono: '999999999',
        email: 'correo@no',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.mensaje).toMatch(/formato inválido/i);
  });

  test('❌ Campo no permitido', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Cookie', cookieAdmin)
      .send({ nombre: 'X', dni: '321', telefono: '456', otro: 'no va' });

    expect(res.statusCode).toBe(400);
    expect(res.body.mensaje).toMatch(/no están permitidos/i);
  });

  test('❌ XSS detectado', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Cookie', cookieAdmin)
      .send({ nombre: '<script>', dni: '123', telefono: '456' });

    expect(res.statusCode).toBe(400);
    expect(res.body.mensaje).toMatch(/no permitidos/i);
  });

  test('❌ Estado inválido (negado en servicio)', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Cookie', cookieAdmin)
      .send({ nombre: 'X', dni: '111', telefono: '456', estado: 'suspendido' });

    expect(res.statusCode).toBe(400);
    expect(res.body.mensaje).toMatch(/no están permitidos: estado/i);
  });

  test('❌ Calificación inválida (negada en servicio)', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Cookie', cookieAdmin)
      .send({
        nombre: 'X',
        dni: '112',
        telefono: '789',
        calificacion: 'muy_malo',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.mensaje).toMatch(/no están permitidos: calificacion/i);
  });
});
