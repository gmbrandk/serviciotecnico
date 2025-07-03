const request = require('supertest');
const mongoose = require('mongoose');
const app = require('app');
const Cliente = require('@models/Cliente');
const Movimiento = require('@models/Movimiento');

let cliente;
let cookieAdmin;

beforeAll(async () => {
  // Asumimos que hay un helper que crea un superadmin logueado y devuelve su cookie
  cookieAdmin = await crearUsuarioYLogin();
});

beforeEach(async () => {
  await Cliente.deleteMany({});
  await Movimiento.deleteMany({});

  cliente = await Cliente.create({
    nombre: 'Prueba Cliente',
    dni: '12345678',
    telefono: '+51987654321',
    email: 'prueba@cliente.com',
    estado: 'activo',
    calificacion: 'regular',
    isActivo: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('🧪 EstadoClienteController', () => {
  test('✅ Suspensión correcta', async () => {
    const res = await request(app)
      .patch(`/api/clientes/${cliente._id}/suspender`)
      .set('Cookie', cookieAdmin);

    expect(res.statusCode).toBe(200);
    expect(res.body.details.cliente.estado).toBe('suspendido');
    expect(res.body.details.cliente.calificacion).toBe('malo');

    const movimiento = await Movimiento.findOne({ entidadId: cliente._id });
    expect(movimiento).toBeTruthy();
    expect(movimiento.metadata.get('calificacionAnterior')).toBe('regular');
    expect(movimiento.metadata.get('cambioPorSuspension')).toBe(true);
  });

  test('✅ Reactivación devuelve calificación anterior desde metadata', async () => {
    // Primero suspender
    await request(app)
      .patch(`/api/clientes/${cliente._id}/suspender`)
      .set('Cookie', cookieAdmin);

    // Luego reactivar
    const res = await request(app)
      .patch(`/api/clientes/${cliente._id}/reactivar`)
      .set('Cookie', cookieAdmin);

    expect(res.statusCode).toBe(200);
    expect(res.body.details.cliente.estado).toBe('activo');
    expect(res.body.details.cliente.calificacion).toBe('regular'); // restaurada
  });

  test('✅ Baja definitiva registra movimiento con motivo', async () => {
    // Suspender primero
    await request(app)
      .patch(`/api/clientes/${cliente._id}/suspender`)
      .set('Cookie', cookieAdmin);

    // Luego dar de baja
    const res = await request(app)
      .patch(`/api/clientes/${cliente._id}/baja-definitiva`)
      .set('Cookie', cookieAdmin)
      .send({ motivo: 'Incumplimiento grave de normas' });

    expect(res.statusCode).toBe(200);
    expect(res.body.details.cliente.estado).toBe('baneado');
    expect(res.body.details.cliente.calificacion).toBe('muy_malo');

    const movimiento = await Movimiento.findOne({ entidadId: cliente._id });
    expect(movimiento).toBeTruthy();
    expect(movimiento.metadata.get('motivo')).toMatch(/incumplimiento/i);
  });

  test('❌ No puede saltarse directamente a baja definitiva desde estado activo', async () => {
    const res = await request(app)
      .patch(`/api/clientes/${cliente._id}/baja-definitiva`)
      .set('Cookie', cookieAdmin)
      .send({ motivo: 'Prueba de error de flujo' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/no se puede pasar de/i);
  });

  test('❌ No puede suspender cliente baneado', async () => {
    cliente.estado = 'baneado';
    cliente.isActivo = false;
    cliente.calificacion = 'muy_malo';
    await cliente.save();

    const res = await request(app)
      .patch(`/api/clientes/${cliente._id}/suspender`)
      .set('Cookie', cookieAdmin);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/ya está baneado/i);
  });
});
