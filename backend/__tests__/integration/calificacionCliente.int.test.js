// __tests__/integration/clientes.int.test.js
const request = require('supertest');
const app = require('app'); // Asegúrate que apunte correctamente
const mongoose = require('mongoose');
const Cliente = require('@models/Cliente');
const Usuario = require('@models/Usuario');
const Equipo = require('@models/Equipo');
const OrdenServicio = require('@models/OrdenServicio');

describe('🧪 Integración: Calificación de cliente', () => {
  let cliente, tecnico, representante, equipo;

  beforeAll(async () => {
    await Cliente.deleteMany();
    await Usuario.deleteMany();
    await Equipo.deleteMany();
    await OrdenServicio.deleteMany();

    tecnico = await Usuario.create({
      nombre: 'Tecnico',
      email: 'tecnico@test.com',
      password: '123456',
      role: 'tecnico',
    });

    representante = await Usuario.create({
      nombre: 'Representante',
      email: 'representante@test.com',
      password: '123456',
      role: 'tecnico',
    });

    cliente = await Cliente.create({
      nombre: 'Cliente de Prueba',
      dni: '98765432',
    });

    equipo = await Equipo.create({
      tipo: 'Laptop',
      marca: 'Lenovo',
      modelo: 'ThinkPad',
      nroSerie: 'SN123',
      clienteActual: cliente._id,
    });

    // Crear 5 órdenes reparadas
    for (let i = 0; i < 5; i++) {
      await OrdenServicio.create({
        cliente: cliente._id,
        equipo: equipo._id,
        tecnico: tecnico._id,
        representante: representante._id,
        estadoOS: 'finalizado',
        estadoEquipo: 'reparado',
        total: 100,
      });
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('🔸 debería calificar como "muy_bueno" si tiene 5 órdenes reparadas', async () => {
    const res = await request(app).put(
      `/api/clientes/calificar/${cliente._id}`
    );

    console.log('🧾 Response:', res.body);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.cliente.calificacion).toBe('muy_bueno');
    expect(res.body.cliente.estado).toBe('activo');
  });
  it('🔸 debería ignorar órdenes "irreparable" al calcular calificación', async () => {
    // 1. Crear cliente de prueba
    const cliente = await Cliente.create({
      nombre: 'Cliente Neutro',
      dni: '12312312',
    });

    // 2. Crear un técnico y un equipo para asociar las órdenes
    const tecnico = await Usuario.create({
      nombre: 'Técnico Test',
      email: 'tecnico@example.com',
      password: '123456',
      role: 'tecnico',
    });

    const equipo = await Equipo.create({
      tipo: 'laptop',
      marca: 'Dell',
      modelo: 'XPS',
      nroSerie: 'SN12345',
      clienteActual: cliente._id,
    });

    // 3. Crear órdenes: 3 irreparables (no deben contar), 2 reparadas (deben contar como buenas)
    const ordenes = [
      { estadoEquipo: 'irreparable' },
      { estadoEquipo: 'irreparable' },
      { estadoEquipo: 'irreparable' },
      { estadoEquipo: 'irreparable' },
      { estadoEquipo: 'irreparable' },
    ];

    await Promise.all(
      ordenes.map((orden) =>
        OrdenServicio.create({
          cliente: cliente._id,
          equipo: equipo._id,
          tecnico: tecnico._id,
          representante: tecnico._id, // mismo técnico
          estadoOS: 'finalizado',
          estadoEquipo: orden.estadoEquipo,
          total: 100,
        })
      )
    );

    // 4. Llamar a la API de calificación
    const res = await request(app).put(
      `/api/clientes/calificar/${cliente._id}`
    );

    console.log('🧾 Response:', res.body);

    // 5. Verificar que solo las reparadas se hayan contado y se haya calificado como 'muy_bueno'
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.cliente.calificacion).toBe('regular');
    expect(res.body.cliente.estado).toBe('activo');
  });
});
