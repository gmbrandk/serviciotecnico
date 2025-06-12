const request = require('supertest');
const app = require('app'); // Ajusta el path según tu estructura
const Cliente = require('@models/Cliente');
const OrdenServicio = require('@models/OrdenServicio');

describe('🧪 Integración: Calificación de cliente', () => {
  let cliente;

  beforeEach(async () => {
    await Cliente.deleteMany();
    await OrdenServicio.deleteMany();

    cliente = await Cliente.create({
      nombre: 'Carlos Test',
      dni: '12345678',
      estado: 'activo',
      isActivo: true,
      calificacion: 'regular',
    });
  });

  test('🔸 debería calificar como "muy_malo" si está baneado', async () => {
    cliente.estado = 'baneado';
    await cliente.save();

    const res = await request(app).put(
      `/api/clientes/calificar/${cliente._id}`
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.cliente.calificacion).toBe('muy_malo');
    expect(res.body.cliente.estado).toBe('suspendido');
    expect(res.body.mensaje).toMatch(/baneado/i);
  });

  test('🔸 debería calificar como "muy_bueno" si tiene 5 órdenes reparadas', async () => {
    const ordenes = Array(5)
      .fill()
      .map(() => ({
        cliente: cliente._id,
        estado: 'finalizado',
        estadoFinal: 'reparado',
      }));
    await OrdenServicio.insertMany(ordenes);

    const res = await request(app).put(
      `/api/clientes/calificar/${cliente._id}`
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.cliente.calificacion).toBe('muy_bueno');
  });

  test('🔸 debería calificar como "malo" si tiene observaciones negativas', async () => {
    const ordenes = [
      {
        cliente: cliente._id,
        estado: 'finalizado',
        estadoFinal: 'reparado',
        observaciones: 'Pago tardío y comportamiento problemático',
      },
    ];
    await OrdenServicio.insertMany(ordenes);

    const res = await request(app).put(
      `/api/clientes/calificar/${cliente._id}`
    );

    expect(res.status).toBe(200);
    expect(res.body.cliente.calificacion).toBe('malo');
  });

  test('🔸 debería calificar como "bueno" si tiene observaciones tipo "frecuente"', async () => {
    cliente.observaciones = 'Cliente frecuente y respetuoso';
    await cliente.save();

    const ordenes = [
      {
        cliente: cliente._id,
        estado: 'finalizado',
        estadoFinal: 'no_reparado',
      },
    ];
    await OrdenServicio.insertMany(ordenes);

    const res = await request(app).put(
      `/api/clientes/calificar/${cliente._id}`
    );

    expect(res.status).toBe(200);
    expect(res.body.cliente.calificacion).toBe('bueno');
  });

  test('🔸 debería retornar 404 si el cliente no existe', async () => {
    const fakeId = '64f1c5e3f0f69e9ef0000000';
    const res = await request(app).put(`/api/clientes/calificar/${fakeId}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.mensaje).toMatch(/no encontrado/i);
  });
});
