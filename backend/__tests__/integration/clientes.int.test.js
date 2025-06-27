const request = require('supertest');
const app = require('../../app');
const { conectarDB, desconectarDB, limpiarDB } = require('../setup');
const crearUsuarioYLogin = require('../helpers/crearUsuarioYLogin');
const crearClienteTest = require('../helpers/crearClienteTest');
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

describe('🧪 CRUD de Clientes', () => {
  beforeEach(async () => {
    await limpiarDB(); // 🧼 No borra usuarios
  });

  test('✅ Crear cliente', async () => {
    const cliente = await crearClienteTest(cookieAdmin);
    expect(cliente).toBeDefined();
    expect(cliente.nombre).toMatch(/Cliente Test/);
  });

  test('✏️ Editar cliente', async () => {
    const cliente = await crearClienteTest(cookieAdmin);

    const res = await request(app)
      .put(`/api/clientes/${cliente._id}`)
      .set('Cookie', cookieAdmin)
      .send({ nombre: 'Nombre Actualizado' });

    expect(res.statusCode).toBe(200);
    expect(res.body.details.cliente.nombre).toBe('Nombre Actualizado');
  });

  test('🚫 Suspender cliente', async () => {
    const cliente = await crearClienteTest(cookieAdmin);

    const res = await request(app)
      .patch(`/api/clientes/${cliente._id}/suspender`)
      .set('Cookie', cookieAdmin);

    expect(res.statusCode).toBe(200);
    expect(res.body.details.cliente.estado).toBe('suspendido');
  });

  test('🔁 Reactivar cliente', async () => {
    const cliente = await crearClienteTest(cookieAdmin);

    await request(app)
      .patch(`/api/clientes/${cliente._id}/suspender`)
      .set('Cookie', cookieAdmin);

    const res = await request(app)
      .patch(`/api/clientes/${cliente._id}/reactivar`)
      .set('Cookie', cookieAdmin);

    expect(res.statusCode).toBe(200);
    expect(res.body.details.cliente.estado).toBe('activo');
  });

  test('⛔️ Confirmar baja definitiva', async () => {
    const cliente = await crearClienteTest(cookieAdmin);

    const res = await request(app)
      .patch(`/api/clientes/${cliente._id}/baja-definitiva`)
      .set('Cookie', cookieAdmin);

    expect(res.statusCode).toBe(403); // administrador no tiene permiso
  });

  test('🧠 Calificar cliente', async () => {
    const cliente = await crearClienteTest(cookieAdmin);

    const res = await request(app)
      .put(`/api/clientes/${cliente._id}/calificar`)
      .set('Cookie', cookieAdmin);

    expect(res.statusCode).toBe(200);
    expect(res.body.cliente.calificacion).toBeDefined();
  });

  test('📄 Obtener todos los clientes', async () => {
    await crearClienteTest(cookieAdmin);
    await crearClienteTest(cookieAdmin);

    const res = await request(app)
      .get('/api/clientes')
      .set('Cookie', cookieAdmin);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.details.clientes)).toBe(true);
    expect(res.body.details.clientes.length).toBeGreaterThanOrEqual(2);
  });
});
