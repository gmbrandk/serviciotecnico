// __tests__/clientes.int.test.js
const request = require('supertest');
const app = require('../../app');
const { conectarDB, desconectarDB, limpiarDB } = require('../setup');
const crearUsuarioYLogin = require('../helpers/crearUsuarioYLogin');
const crearClienteTest = require('../helpers/crearClienteTest');
const Usuario = require('@models/Usuario');
const logger = require('../../testLogger');

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
  logger.initLogger(__filename);
});

afterAll(async () => {
  try {
    await limpiarDB();
    await desconectarDB();
  } catch (error) {
    console.error('❌ Error en afterAll:', error);
  }
  logger.closeLogger();
});

describe('🧪 CRUD de Clientes', () => {
  beforeEach(async () => {
    await limpiarDB();
  });

  test('✅ Crear cliente', async () => {
    logger.setCurrentTest('✅ Crear cliente');
    const cliente = await crearClienteTest(cookieAdmin);
    logger.log(`Cliente creado: ${cliente.nombre}`);
    expect(cliente).toBeDefined();
    expect(cliente.nombre).toMatch(/Cliente Test/);
  });

  test('✏️ Editar cliente', async () => {
    logger.setCurrentTest('✏️ Editar cliente');
    const cliente = await crearClienteTest(cookieAdmin);

    const res = await request(app)
      .put(`/api/clientes/${cliente._id}`)
      .set('Cookie', cookieAdmin)
      .send({ nombre: 'Nombre Actualizado' });

    logger.log(`Respuesta: ${res.statusCode}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.details.cliente.nombre).toBe('Nombre Actualizado');
  });

  test('🚫 Suspender cliente', async () => {
    logger.setCurrentTest('🚫 Suspender cliente');
    const cliente = await crearClienteTest(cookieAdmin);

    const res = await request(app)
      .patch(`/api/clientes/${cliente._id}/suspender`)
      .set('Cookie', cookieAdmin);

    logger.log(`Estado nuevo: ${res.body.details.cliente.estado}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.details.cliente.estado).toBe('suspendido');
  });

  test('🔁 Reactivar cliente', async () => {
    logger.setCurrentTest('🔁 Reactivar cliente');
    const cliente = await crearClienteTest(cookieAdmin);

    await request(app)
      .patch(`/api/clientes/${cliente._id}/suspender`)
      .set('Cookie', cookieAdmin);

    const res = await request(app)
      .patch(`/api/clientes/${cliente._id}/reactivar`)
      .set('Cookie', cookieAdmin);

    logger.log(`Estado reactivado: ${res.body.details.cliente.estado}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.details.cliente.estado).toBe('activo');
  });

  test('⛔️ Confirmar baja definitiva', async () => {
    logger.setCurrentTest('⛔️ Confirmar baja definitiva');
    const cliente = await crearClienteTest(cookieAdmin);

    const res = await request(app)
      .patch(`/api/clientes/${cliente._id}/baja-definitiva`)
      .set('Cookie', cookieAdmin);

    logger.log(`Intento de baja - Código: ${res.statusCode}`);
    expect(res.statusCode).toBe(403);
  });

  test('🧠 Calificar cliente', async () => {
    logger.setCurrentTest('🧠 Calificar cliente');
    const cliente = await crearClienteTest(cookieAdmin);

    const res = await request(app)
      .put(`/api/clientes/${cliente._id}/calificar`)
      .set('Cookie', cookieAdmin);

    logger.log(`Calificación recibida: ${res.body.cliente.calificacion}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.cliente.calificacion).toBeDefined();
  });

  test('📄 Obtener todos los clientes', async () => {
    logger.setCurrentTest('📄 Obtener todos los clientes');
    await crearClienteTest(cookieAdmin);
    await crearClienteTest(cookieAdmin);

    const res = await request(app)
      .get('/api/clientes')
      .set('Cookie', cookieAdmin);

    logger.log(`Total de clientes: ${res.body.details.clientes.length}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.details.clientes)).toBe(true);
    expect(res.body.details.clientes.length).toBeGreaterThanOrEqual(2);
  });
});
