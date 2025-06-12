const mongoose = require('mongoose');
const request = require('supertest');
const app = require('app'); // ajusta si tu app se importa diferente
const Cliente = require('@models/Cliente');

beforeAll(async () => {
  const mongoURI = process.env.MONGODB_URI_TEST;
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoURI);
  }
});

beforeEach(async () => {
  await Cliente.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('🧪 Integración: Estado de cliente', () => {
  it('🧪 debería responder 404 si la ruta no existe', async () => {
    const res = await request(app).patch('/api/clientes/ruta-fake');
    expect(res.status).toBe(404);
  });

  it('🔸 debería suspender correctamente a un cliente activo', async () => {
    const cliente = await Cliente.create({
      nombre: 'Cliente Test',
      dni: '12345678',
      telefono: '999999999',
      email: 'cliente@test.com',
      estado: 'activo',
      isActivo: true,
      calificacion: 'bueno',
    });

    const res = await request(app).patch(
      `/api/clientes/suspender/${cliente._id}`
    );

    console.log('🔍 BODY:', res.body);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.mensaje).toBe('Cliente suspendido correctamente');
    expect(res.body.details.cliente.estado).toBe('suspendido');
    expect(res.body.details.cliente.isActivo).toBe(false);
    expect(res.body.details.cliente.calificacion).toBe('malo');
  });

  it('🔸 debería reactivar un cliente suspendido', async () => {
    const cliente = await Cliente.create({
      nombre: 'Cliente Suspendido',
      dni: '87654321',
      telefono: '988888888',
      email: 'suspendido@test.com',
      estado: 'suspendido',
      isActivo: false,
      calificacion: 'malo',
    });

    const res = await request(app).patch(
      `/api/clientes/reactivar/${cliente._id}`
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.mensaje).toBe('Cliente reactivado correctamente');
    expect(res.body.details.cliente.estado).toBe('activo');
    expect(res.body.details.cliente.isActivo).toBe(true);
    expect(res.body.details.cliente.calificacion).toBe('bueno');
  });

  it('🔸 debería dar de baja definitivamente a un cliente', async () => {
    const cliente = await Cliente.create({
      nombre: 'Cliente Baja',
      dni: '22223333',
      telefono: '977777777',
      email: 'baja@test.com',
      estado: 'activo',
      isActivo: true,
      calificacion: 'bueno',
    });

    const res = await request(app).patch(
      `/api/clientes/confirmar-baja/${cliente._id}`
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.mensaje).toBe('Baja definitiva confirmada correctamente');
    expect(res.body.details.cliente.estado).toBe('baneado');
    expect(res.body.details.cliente.isActivo).toBe(false);
    expect(res.body.details.cliente.calificacion).toBe('muy_malo');
  });
});
