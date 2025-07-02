// 📁 __tests__/integration/editarClienteController.int.test.js
const request = require('supertest');
const app = require('../../app');
const Cliente = require('@models/Cliente');
const OrdenServicio = require('@models/OrdenServicio');
const { conectarDB, desconectarDB, limpiarDB } = require('../setup');
const crearUsuarioYLogin = require('../helpers/crearUsuarioYLogin');
const Usuario = require('@models/Usuario');

jest.mock('@models/OrdenServicio');

let cookieAdmin;

beforeAll(async () => {
  await Usuario.deleteOne({ email: 'admin@test.com' });
  await conectarDB();

  const { cookie } = await crearUsuarioYLogin({
    nombre: 'Admin Test',
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
  jest.clearAllMocks();
});

describe('🔁 PUT /api/clientes/:id - Edición con validación y mock de órdenes', () => {
  test('✅ Actualiza nombre y formatea teléfono', async () => {
    const cliente = await Cliente.create({
      nombre: 'Carlos',
      dni: '87654321',
      telefono: '+51987654321',
      email: 'carlos@correo.com',
    });

    OrdenServicio.findOne.mockResolvedValue(null);

    const res = await request(app)
      .put(`/api/clientes/${cliente._id}`)
      .set('Cookie', cookieAdmin)
      .send({
        nombre: 'Carlos Actualizado',
        telefono: '987521495',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.details.cliente.nombre).toBe('Carlos Actualizado');
    expect(res.body.details.cliente.telefono).toBe('+51987521495');
  });

  test('🛑 Rechaza edición si cliente tiene órdenes activas (mock)', async () => {
    OrdenServicio.findOne.mockResolvedValueOnce({ _id: 'orden123' });

    const cliente = await Cliente.create({
      nombre: 'Cliente Orden Activa',
      dni: '99887766',
      telefono: '+51988888888',
      email: 'orden@correo.com',
    });

    const res = await request(app)
      .put(`/api/clientes/${cliente._id}`)
      .set('Cookie', cookieAdmin)
      .send({ nombre: 'Nombre Nuevo' });

    expect(res.statusCode).toBe(400);
    expect(res.body.mensaje).toMatch(/órdenes de servicio activas/i);
  });

  test('🛑 No permite cambio de DNI', async () => {
    OrdenServicio.findOne.mockResolvedValue(null);

    const cliente = await Cliente.create({
      nombre: 'Cliente DNI',
      dni: '55554444',
      telefono: '+51900000000',
      email: 'dni@correo.com',
    });

    const res = await request(app)
      .put(`/api/clientes/${cliente._id}`)
      .set('Cookie', cookieAdmin)
      .send({ dni: '00001111' });

    expect(res.statusCode).toBe(400);
    expect(res.body.mensaje).toMatch(/no está permitido cambiar el DNI/i);
  });

  test('🛑 Rechaza teléfono inválido', async () => {
    OrdenServicio.findOne.mockResolvedValue(null);

    const cliente = await Cliente.create({
      nombre: 'Teléfono Malo',
      dni: '44443333',
      telefono: '+51999999999',
      email: 'invalido@correo.com',
    });

    const res = await request(app)
      .put(`/api/clientes/${cliente._id}`)
      .set('Cookie', cookieAdmin)
      .send({ telefono: 'abc123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.mensaje).toMatch(/El número solo debe contener/i);
  });

  test('🛑 Rechaza campos no permitidos', async () => {
    OrdenServicio.findOne.mockResolvedValue(null);

    const cliente = await Cliente.create({
      nombre: 'Carlos Original',
      dni: '33332222',
      telefono: '+51988877766',
      email: 'carlos@correo.com',
    });

    const res = await request(app)
      .put(`/api/clientes/${cliente._id}`)
      .set('Cookie', cookieAdmin)
      .send({
        nombre: 'Carlos Editado',
        rol: 'admin', // campo no permitido
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.mensaje).toMatch(/no están permitidos en esta ruta: rol/i);
  });

  test('🛑 Rechaza estado inválido (suspendido o baneado)', async () => {
    OrdenServicio.findOne.mockResolvedValue(null);

    const cliente = await Cliente.create({
      nombre: 'Estado Test',
      dni: '12341234',
      telefono: '+51922222222',
      email: 'estado@correo.com',
    });

    const res = await request(app)
      .put(`/api/clientes/${cliente._id}`)
      .set('Cookie', cookieAdmin)
      .send({ estado: 'baneado' });

    expect(res.statusCode).toBe(400);
    expect(res.body.mensaje).toMatch(
      /Los siguientes campos no están permitidos/i
    );
  });

  test('🛑 Rechaza calificación negativa (malo o muy_malo)', async () => {
    OrdenServicio.findOne.mockResolvedValue(null);

    const cliente = await Cliente.create({
      nombre: 'Calificación Test',
      dni: '43214321',
      telefono: '+51933333333',
      email: 'calificacion@correo.com',
    });

    const res = await request(app)
      .put(`/api/clientes/${cliente._id}`)
      .set('Cookie', cookieAdmin)
      .send({ calificacion: 'muy_malo' });

    expect(res.statusCode).toBe(400);
    expect(res.body.mensaje).toMatch(
      /Los siguientes campos no están permitidos/i
    );
  });

  test('🛑 Rechaza calificación positiva (bueno o muy_bueno)', async () => {
    OrdenServicio.findOne.mockResolvedValue(null);

    const cliente = await Cliente.create({
      nombre: 'Calificación Test',
      dni: '43214321',
      telefono: '+51933333333',
      email: 'calificacion@correo.com',
    });

    const res = await request(app)
      .put(`/api/clientes/${cliente._id}`)
      .set('Cookie', cookieAdmin)
      .send({ calificacion: 'bueno' });

    expect(res.statusCode).toBe(400);
    expect(res.body.mensaje).toMatch(
      /Los siguientes campos no están permitidos/i
    );
  });

  test('🛑 Rechaza email duplicado', async () => {
    OrdenServicio.findOne.mockResolvedValue(null);

    await Cliente.create({
      nombre: 'Cliente Original',
      dni: '11112222',
      telefono: '+51944444444',
      email: 'duplicado@correo.com',
    });

    const cliente = await Cliente.create({
      nombre: 'Cliente Editado',
      dni: '33334444',
      telefono: '+51955555555',
      email: 'editado@correo.com',
    });

    const res = await request(app)
      .put(`/api/clientes/${cliente._id}`)
      .set('Cookie', cookieAdmin)
      .send({ email: 'duplicado@correo.com' });

    expect(res.statusCode).toBe(400);
    expect(res.body.mensaje).toMatch(/ya existe un cliente con ese correo/i);
  });

  test('🛑 Rechaza teléfono duplicado', async () => {
    OrdenServicio.findOne.mockResolvedValue(null);

    await Cliente.create({
      nombre: 'Cliente Tel 1',
      dni: '66667777',
      telefono: '+51966666666',
      email: 'uno@correo.com',
    });

    const cliente = await Cliente.create({
      nombre: 'Cliente Tel 2',
      dni: '77778888',
      telefono: '+51977777777',
      email: 'dos@correo.com',
    });

    const res = await request(app)
      .put(`/api/clientes/${cliente._id}`)
      .set('Cookie', cookieAdmin)
      .send({ telefono: '966666666' }); // se normaliza a +51966666666

    expect(res.statusCode).toBe(400);
    expect(res.body.mensaje).toMatch(/ya existe un cliente con ese teléfono/i);
  });
});
