const request = require('supertest');
const mongoose = require('mongoose');
const app = require('app');
const Cliente = require('@models/Cliente');

describe('🧪 Integración: Suspensión de cliente', () => {
  let clienteId;

  beforeAll(async () => {
    // Limpiar la colección
    await Cliente.deleteMany({});

    // Crear un cliente activo
    const cliente = await Cliente.create({
      nombre: 'Cliente Test',
      dni: '12345678',
      telefono: '999999999',
      email: 'cliente@test.com',
      estado: 'activo',
      calificacion: 'bueno',
      isActivo: true,
    });

    clienteId = cliente._id;
  });

  afterAll(async () => {
    await mongoose.connection.close(); // Ya definido en setup.js pero por si acaso
  });

  it('🔸 debería suspender correctamente a un cliente activo', async () => {
    const res = await request(app).patch(
      `/api/clientes/suspender/${clienteId}`
    );

    expect(res.status).toBe(200);

    expect(res.body.success).toBe(true);
    expect(res.body.mensaje).toBe('Cliente suspendido correctamente');
    expect(res.body.details.cliente.estado).toBe('suspendido');
    expect(res.body.details.cliente.calificacion).toBe('malo');
    expect(res.body.details.cliente.isActivo).toBe(false);
  });

  it('🔸 debería retornar un mensaje si el cliente ya está suspendido', async () => {
    const res = await request(app).patch(
      `/api/clientes/suspender/${clienteId}`
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.mensaje).toBe('El cliente ya se encuentra suspendido');
    expect(res.body.details.cliente.estado).toBe('suspendido');
    expect(res.body.details.cliente.isActivo).toBe(false);
  });

  it('❌ debería retornar error si el ID no es válido', async () => {
    const res = await request(app).patch(`/api/clientes/suspender/ID_INVALIDO`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.mensaje).toBe('ID inválido');
  });

  it('❌ debería retornar error si el cliente no existe', async () => {
    const idValidoPeroInexistente = new mongoose.Types.ObjectId();
    const res = await request(app).patch(
      `/api/clientes/suspender/${idValidoPeroInexistente}`
    );

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.mensaje).toBe('Cliente no encontrado');
  });
});
