const request = require('supertest');
const app = require('../../app');
const { conectarDB, desconectarDB, limpiarDB } = require('../setup');
const crearUsuarioYLogin = require('../helpers/crearUsuarioYLogin');
const Usuario = require('@models/Usuario');

let cookieAdmin, clienteId;

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

  test('✏️ Editar cliente', async () => {
    // Primero crear el cliente
    const createRes = await request(app)
      .post('/api/clientes')
      .set('Cookie', cookieAdmin)
      .send({ nombre: 'Editar Test', dni: '11111111', email: 'edit@test.com' });

    const id = createRes.body.cliente._id;

    const res = await request(app)
      .put(`/api/clientes/${id}`)
      .set('Cookie', cookieAdmin)
      .send({ nombre: 'Nombre Actualizado' });

    expect(res.statusCode).toBe(200);
    expect(res.body.cliente.nombre).toBe('Nombre Actualizado');
  });

  test('🚫 Suspender cliente', async () => {
    const { body } = await request(app)
      .post('/api/clientes')
      .set('Cookie', cookieAdmin)
      .send({ nombre: 'Cliente', dni: '22222222', email: 'c2@test.com' });

    const res = await request(app)
      .patch(`/api/clientes/${body.cliente._id}/suspender`)
      .set('Cookie', cookieAdmin);

    expect(res.statusCode).toBe(200);
    expect(res.body.cliente.estado).toBe('suspendido');
  });

  test('🔁 Reactivar cliente', async () => {
    const { body } = await request(app)
      .post('/api/clientes')
      .set('Cookie', cookieAdmin)
      .send({ nombre: 'Cliente', dni: '33333333', email: 'c3@test.com' });

    // suspender primero
    await request(app)
      .patch(`/api/clientes/${body.cliente._id}/suspender`)
      .set('Cookie', cookieAdmin);

    // reactivar
    const res = await request(app)
      .patch(`/api/clientes/${body.cliente._id}/reactivar`)
      .set('Cookie', cookieAdmin);

    expect(res.statusCode).toBe(200);
    expect(res.body.cliente.estado).toBe('activo');
  });

  test('⛔️ Confirmar baja definitiva', async () => {
    const { body } = await request(app)
      .post('/api/clientes')
      .set('Cookie', cookieAdmin)
      .send({ nombre: 'Cliente', dni: '44444444', email: 'c4@test.com' });

    const res = await request(app)
      .patch(`/api/clientes/${body.cliente._id}/baja-definitiva`)
      .set('Cookie', cookieAdmin);

    expect(res.statusCode).toBe(403); // administrador no tiene permiso
  });

  test('🧠 Calificar cliente', async () => {
    const { body } = await request(app)
      .post('/api/clientes')
      .set('Cookie', cookieAdmin)
      .send({ nombre: 'Cliente', dni: '55555555', email: 'c5@test.com' });

    const res = await request(app)
      .put(`/api/clientes/${body.cliente._id}/calificar`)
      .set('Cookie', cookieAdmin);

    expect(res.statusCode).toBe(200);
    expect(res.body.cliente.calificacion).toBeDefined();
  });

  test('📄 Obtener todos los clientes', async () => {
    const res = await request(app)
      .get('/api/clientes')
      .set('Cookie', cookieAdmin);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.clientes)).toBe(true);
  });
});
