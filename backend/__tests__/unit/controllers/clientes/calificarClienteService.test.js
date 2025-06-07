const mongoose = require('mongoose');
const request = require('supertest');
const app = require('app'); // Asegúrate de que este sea tu archivo Express principal
const Cliente = require('@models/Cliente');
const OrdenServicio = require('@models/OrdenServicio');
const {
  crearClienteYOrdenes,
} = require('../../../helpers/crearClienteyOrdenes');

describe('🧪 Calificar Cliente - Integración', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST);
  });

  afterEach(async () => {
    await Cliente.deleteMany();
    await OrdenServicio.deleteMany();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('✅ Cliente con 6 órdenes reparadas debe ser "muy_bueno"', async () => {
    const cliente = await crearClienteYOrdenes({
      numOrdenes: 6,
      reparadas: 6,
    });

    const res = await request(app).put(
      `/api/clientes/calificar/${cliente._id}`
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.cliente.calificacion).toBe('muy_bueno');
  });

  it('🚫 Cliente baneado debe recibir "muy_malo" y estado "suspendido"', async () => {
    const cliente = await crearClienteYOrdenes({
      estadoCliente: 'baneado',
      numOrdenes: 0,
    });

    const res = await request(app).put(
      `/api/clientes/calificar/${cliente._id}`
    );

    expect(res.status).toBe(200);
    expect(res.body.cliente.calificacion).toBe('muy_malo');
    expect(res.body.cliente.estado).toBe('suspendido');
  });

  it('😠 Cliente con 2 observaciones negativas debe ser "muy_malo"', async () => {
    const cliente = await crearClienteYOrdenes({
      numOrdenes: 5,
      reparadas: 5,
      observacionesNegativas: 2,
    });

    const res = await request(app).put(
      `/api/clientes/calificar/${cliente._id}`
    );

    expect(res.status).toBe(200);
    expect(res.body.cliente.calificacion).toBe('muy_malo');
  });

  it('🥇 Cliente frecuente con calificación base "regular" sube a "bueno"', async () => {
    const cliente = await crearClienteYOrdenes({
      numOrdenes: 4,
      reparadas: 2,
      observaciones: 'cliente frecuente',
    });

    const res = await request(app).put(
      `/api/clientes/calificar/${cliente._id}`
    );

    expect(res.status).toBe(200);
    expect(res.body.cliente.calificacion).toBe('bueno');
  });

  it('🔍 Cliente inexistente debe lanzar 404', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app).put(`/api/clientes/calificar/${fakeId}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.mensaje).toMatch(/no encontrado/i);
  });
});
