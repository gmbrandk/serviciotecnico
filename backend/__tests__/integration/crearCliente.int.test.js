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
    expect(res.body.mensaje).toMatch(/obligatorio/i);
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

describe('🧪 Validaciones - Crear Cliente', () => {
  test('🛑 Rechaza si falta el nombre', async () => {
    const res = await request(app)
      .post('/api/clientes')
      .set('Cookie', cookieAdmin)
      .send({
        dni: '12345678',
        telefono: '987654321',
        direccion: 'Calle Falsa 123',
        email: 'faltaNombre@correo.com',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.mensaje).toMatch(/nombre.*obligatorio/i);
  });

  test('🛑 Rechaza si falta el DNI', async () => {
    const res = await request(app)
      .post('/api/clientes')
      .set('Cookie', cookieAdmin)
      .send({
        nombre: 'Sin DNI',
        telefono: '987654321',
        direccion: 'Calle 123',
        email: 'sinDni@correo.com',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.mensaje).toMatch(/dni.*obligatorio/i);
  });

  test('🛑 Rechaza si falta el teléfono', async () => {
    const res = await request(app)
      .post('/api/clientes')
      .set('Cookie', cookieAdmin)
      .send({
        nombre: 'Sin Teléfono',
        dni: '87654321',
        direccion: 'Av Siempre Viva',
        email: 'sintelf@correo.com',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.mensaje).toMatch(/tel[eé]fono.*obligatorio/i);
  });

  test('🛑 Rechaza si el email tiene doble punto', async () => {
    const res = await request(app)
      .post('/api/clientes')
      .set('Cookie', cookieAdmin)
      .send({
        nombre: 'Doble Punto',
        dni: '10293847',
        telefono: '987654321',
        email: 'correo..invalido@dominio.com',
        direccion: 'X',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.mensaje).toMatch(/formato inválido.*doble punto/i);
  });

  test('🛑 Rechaza si el email tiene formato inválido', async () => {
    const res = await request(app)
      .post('/api/clientes')
      .set('Cookie', cookieAdmin)
      .send({
        nombre: 'Email Malo',
        dni: '10293848',
        telefono: '987654321',
        email: 'sin-arroba.com',
        direccion: 'Y',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.mensaje).toMatch(/formato inválido/i);
  });

  test('🛑 Rechaza si envía campos no permitidos', async () => {
    const res = await request(app)
      .post('/api/clientes')
      .set('Cookie', cookieAdmin)
      .send({
        nombre: 'Walter White',
        dni: '11112222',
        telefono: '987123456',
        email: 'walter@heisenberg.com',
        direccion: 'Albuquerque',
        calificacion: 'malo', // no permitido en esta ruta
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.mensaje).toMatch(/no están permitidos/i);
    expect(res.body.mensaje).toMatch(/calificacion/i);
  });

  test('✅ Genera correo automáticamente si no se envía', async () => {
    const res = await request(app)
      .post('/api/clientes')
      .set('Cookie', cookieAdmin)
      .send({
        nombre: 'Generado',
        dni: '77776666',
        telefono: '987321654',
        direccion: 'Sin correo',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.details.cliente.email).toMatch(/@sinemail\.com$/i);
  });
});

describe('📞 Validación de Teléfono', () => {
  test('✅ Teléfono válido Perú con 9 dígitos', async () => {
    const res = await request(app)
      .post('/api/clientes')
      .set('Cookie', cookieAdmin)
      .send({
        nombre: 'Peruano',
        dni: '10000001',
        telefono: '987654321',
        email: 'peru@correo.com',
        direccion: 'Lima',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.details.cliente.telefono).toBe('+51987654321');
  });

  test('✅ Teléfono válido Argentina (ej. +54 9 11 1234 5678)', async () => {
    const res = await request(app)
      .post('/api/clientes')
      .set('Cookie', cookieAdmin)
      .send({
        nombre: 'Argentino',
        dni: '10000002',
        telefono: '+5491112345678',
        email: 'arg@correo.com',
        direccion: 'Buenos Aires',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.details.cliente.telefono).toBe('+5491112345678');
  });

  test('✅ Teléfono válido Chile (ej. +56 9 6123 4567)', async () => {
    const res = await request(app)
      .post('/api/clientes')
      .set('Cookie', cookieAdmin)
      .send({
        nombre: 'Chileno',
        dni: '10000003',
        telefono: '+56961234567',
        email: 'chile@correo.com',
        direccion: 'Santiago',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.details.cliente.telefono).toBe('+56961234567');
  });

  test('🛑 Rechaza teléfono peruano de 8 dígitos', async () => {
    const res = await request(app)
      .post('/api/clientes')
      .set('Cookie', cookieAdmin)
      .send({
        nombre: 'Teléfono Corto',
        dni: '10000004',
        telefono: '98765432',
        email: 'corto@correo.com',
        direccion: 'Lima',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.mensaje).toMatch(/debe tener 9 dígitos/i);
  });

  test('🛑 Rechaza teléfono con caracteres no numéricos', async () => {
    const res = await request(app)
      .post('/api/clientes')
      .set('Cookie', cookieAdmin)
      .send({
        nombre: 'Teléfono Letra',
        dni: '10000005',
        telefono: '98ABC321D',
        email: 'letra@correo.com',
        direccion: 'Arequipa',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.mensaje).toMatch(/El número solo debe contener dígitos /i);
  });

  test('🛑 Rechaza teléfono de país no soportado', async () => {
    const res = await request(app)
      .post('/api/clientes')
      .set('Cookie', cookieAdmin)
      .send({
        nombre: 'Extranjero',
        dni: '10000006',
        telefono: '+9995612345678', // Francia 🇫🇷
        email: 'extranjero@correo.com',
        direccion: 'Francia',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.mensaje).toMatch(/no reconocido/i);
  });
});
