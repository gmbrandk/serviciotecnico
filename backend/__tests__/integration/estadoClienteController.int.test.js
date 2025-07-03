const request = require('supertest');
const app = require('../../app');
const Cliente = require('@models/Cliente');
const Movimiento = require('@models/Movimiento');
const Usuario = require('@models/Usuario');
const { conectarDB, desconectarDB, limpiarDB } = require('../setup');
const crearUsuarioYLogin = require('../helpers/crearUsuarioYLogin');

let cookieAdmin;

beforeAll(async () => {
  await conectarDB();
  await Usuario.deleteOne({ email: 'admin@test.com' });

  const { cookie } = await crearUsuarioYLogin({
    nombre: 'Admin',
    email: 'admin@test.com',
    password: '123456',
    role: 'superadministrador',
  });

  cookieAdmin = cookie;
});

afterAll(async () => {
  await limpiarDB();
  await desconectarDB();
});

beforeEach(async () => {
  await Cliente.deleteMany();
  await Movimiento.deleteMany();
});

describe('📂 Movimiento con metadata - Cambio de estado de cliente', () => {
  test('✅ Al suspender un cliente se crea un movimiento con metadata', async () => {
    const cliente = await Cliente.create({
      nombre: 'Juan Pérez',
      dni: '12345678',
      telefono: '+51987654321',
      email: 'juan@test.com',
      estado: 'activo',
      calificacion: 'muy_bueno',
      isActivo: true,
    });

    const res = await request(app)
      .patch(`/api/clientes/${cliente._id}/suspender`)
      .set('Cookie', cookieAdmin);

    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toMatch(/suspendido/i);

    const movimiento = await Movimiento.findOne({ entidadId: cliente._id });
    console.log(movimiento);

    expect(movimiento).toBeTruthy();
    expect(movimiento.metadata).toBeDefined();
    expect(Object.fromEntries(movimiento.metadata)).toMatchObject({
      estadoAnterior: 'activo',
      calificacionAnterior: 'muy_bueno',
      cambioPorSuspension: true,
    });
  });

  test('✅ Al reactivar un cliente se guarda metadata del estado anterior', async () => {
    const cliente = await Cliente.create({
      nombre: 'Laura Torres',
      dni: '87654321',
      telefono: '+51912345678',
      email: 'laura@test.com',
      estado: 'suspendido',
      calificacion: 'malo',
      isActivo: false,
    });

    console.log(cliente);
    const res = await request(app)
      .patch(`/api/clientes/${cliente._id}/reactivar`)
      .set('Cookie', cookieAdmin);

    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toMatch(/reactivado/i);

    const movimiento = await Movimiento.findOne({ entidadId: cliente._id });
    console.log(movimiento);

    expect(Object.fromEntries(movimiento.metadata)).toMatchObject({
      estadoAnterior: 'suspendido',
      calificacionAnterior: 'malo',
      cambioPorReactivacion: true,
    });
  });

  test('✅ Al dar de baja a un cliente se registra un movimiento con motivo', async () => {
    const cliente = await Cliente.create({
      nombre: 'Skyler White',
      dni: '11112222',
      telefono: '+51955555555',
      email: 'skyler@test.com',
      estado: 'activo',
      calificacion: 'regular',
      isActivo: true,
    });

    // Paso intermedio: suspenderlo
    await request(app)
      .patch(`/api/clientes/${cliente._id}/suspender`)
      .set('Cookie', cookieAdmin);

    // Ahora: baja definitiva
    const motivo = 'Incumplimiento grave de términos del servicio';

    const res = await request(app)
      .patch(`/api/clientes/${cliente._id}/baja-definitiva`)
      .set('Cookie', cookieAdmin)
      .send({ motivo });

    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toMatch(/baja/i);

    const movimiento = await Movimiento.findOne({
      entidadId: cliente._id,
      descripcion: /baja definitivamente/i,
    }).sort({ fecha: -1 });

    expect(movimiento).toBeTruthy();
    expect(Object.fromEntries(movimiento.metadata)).toMatchObject({
      motivo,
    });
  });
});
