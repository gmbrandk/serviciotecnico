// __tests__/integration/equipos.test.js

const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const Equipo = require('@models/Equipo');
const FichaTecnica = require('@models/FichaTecnica');

const crearUsuarioYLogin = require('../helpers/crearUsuarioYLogin');
const crearClienteTest = require('../helpers/crearClienteTest');

describe('🧪 Integración: Crear Equipo', () => {
  let cookie;
  let cliente;

  beforeEach(async () => {
    cookie = (await crearUsuarioYLogin()).cookie;
    cliente = await crearClienteTest(cookie); // ← se asegura que el cliente esté disponible en cada test
  });

  afterEach(async () => {
    await Equipo.deleteMany();
    await FichaTecnica.deleteMany();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('📍 la ruta POST /api/equipos existe y responde con error controlado', async () => {
    const res = await request(app)
      .post('/api/equipos')
      .set('Cookie', cookie)
      .send({}); // Body vacío

    // ✅ No debe responder 404 si la ruta existe, sino un error controlado
    expect([400, 403, 422]).toContain(res.statusCode);
  });

  it('✅ crea un equipo con ficha técnica manual correctamente', async () => {
    const cliente = await crearClienteTest(cookie); // <-- aquí
    const res = await request(app)
      .post('/api/equipos')
      .set('Cookie', cookie)
      .send({
        tipo: 'laptop',
        marca: 'Dell',
        modelo: 'XPS 13',
        sku: 'xps13',
        nroSerie: 'abc001',
        clienteActual: cliente._id,
        fichaTecnicaManual: {
          cpu: 'Intel i7',
          ram: '16GB',
          almacenamiento: '512GB SSD',
          gpu: 'Intel Iris',
        },
      });

    expect(res.statusCode).toBe(201);
  });

  it('🚫 debería rechazar si el número de serie ya existe', async () => {
    const cliente = await crearClienteTest(cookie);

    const equipoPayload = {
      tipo: 'laptop',
      marca: 'Dell',
      modelo: 'XPS 13',
      sku: 'xps13',
      nroSerie: 'abc002',
      clienteActual: cliente._id,
    };

    const res1 = await request(app)
      .post('/api/equipos')
      .set('Cookie', cookie)
      .send(equipoPayload);
    expect(res1.statusCode).toBe(201);

    const res2 = await request(app)
      .post('/api/equipos')
      .set('Cookie', cookie)
      .send(equipoPayload);

    console.log('[⚠️ DUPLICADO]', res2.body);

    expect(res2.statusCode).toBe(400);
    expect(res2.body.mensaje).toMatch(/número de serie/i);
  });

  it('🧼 limpia XSS y convierte modelo/nroSerie/SKU a mayúsculas', async () => {
    const res = await request(app)
      .post('/api/equipos')
      .set('Cookie', cookie)
      .send({
        tipo: 'laptop',
        marca: 'Lenovo',
        modelo: 'X1 <script>alert(1)</script>',
        sku: 'sku<script>',
        nroSerie: 'nro<script>',
        clienteActual: cliente._id,
        fichaTecnicaManual: {
          cpu: 'Intel i5',
          ram: '8GB',
          almacenamiento: '256GB SSD',
          gpu: 'Intel UHD',
        },
      });

    // 🐞 Logs para depuración
    console.log('[🔍 STATUS]', res.statusCode);
    console.log('[🔍 BODY]', JSON.stringify(res.body, null, 2));

    const equipo = res.body.details;

    expect(res.statusCode).toBe(201);
    expect(equipo.modelo).toContain('ALERT(1)');
    expect(equipo.modelo).not.toMatch(/<script>/i);
    expect(equipo.nroSerie).toBe('NRO');
    expect(equipo.sku).toContain('SKU');
  });

  it('🚫 lanza error si no se envía clienteActual', async () => {
    const res = await request(app)
      .post('/api/equipos')
      .set('Cookie', cookie)
      .send({
        tipo: 'laptop',
        marca: 'Acer',
        modelo: 'Aspire 5',
        sku: 'asp5',
        nroSerie: 'noCliente',
        // clienteActual omitido
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.mensaje).toMatch(/clienteActual/i);
  });
});
