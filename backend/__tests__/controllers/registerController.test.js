// tests/registerController.test.js
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app'); // Tu app de Express
const Usuario = require('../models/Usuario');
const CodigoAcceso = require('../models/CodigoAcceso');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Usuario.deleteMany();
  await CodigoAcceso.deleteMany();
});

describe('POST /api/auth/register con código de acceso', () => {
  it('debería registrar un usuario y reducir usosDisponibles en 1', async () => {
    const codigo = await CodigoAcceso.create({
      codigo: 'ABC123',
      usosDisponibles: 2,
      estado: 'activo',
      fechaCreacion: new Date(),
    });

    const res = await request(app).post('/api/auth/register').send({
      nombre: 'usuario1',
      email: 'user@example.com',
      password: '123456',
      role: 'tecnico',
      codigoAcceso: 'ABC123',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);

    const usuario = await Usuario.findOne({ email: 'user@example.com' });
    expect(usuario).not.toBeNull();

    const codigoActualizado = await CodigoAcceso.findOne({ codigo: 'ABC123' });
    expect(codigoActualizado.usosDisponibles).toBe(1);
    expect(codigoActualizado.estado).toBe('activo');
  });

  it('debería eliminar el código si usosDisponibles llega a 0', async () => {
    const codigo = await CodigoAcceso.create({
      codigo: 'XYZ789',
      usosDisponibles: 1,
      estado: 'activo',
      fechaCreacion: new Date(),
    });

    const res = await request(app).post('/api/auth/register').send({
      nombre: 'usuario2',
      email: 'usuario2@example.com',
      password: '123456',
      role: 'tecnico',
      codigoAcceso: 'XYZ789',
    });

    expect(res.statusCode).toBe(201);

    const codigoBorrado = await CodigoAcceso.findOne({ codigo: 'XYZ789' });
    expect(codigoBorrado).toBeNull();
  });

  it('debería rechazar si el código está agotado', async () => {
    await CodigoAcceso.create({
      codigo: 'AGOTADO',
      usosDisponibles: 0,
      estado: 'inactivo',
      fechaCreacion: new Date(),
    });

    const res = await request(app).post('/api/auth/register').send({
      nombre: 'usuario3',
      email: 'usuario3@example.com',
      password: '123456',
      role: 'tecnico',
      codigoAcceso: 'AGOTADO',
    });

    expect(res.statusCode).toBe(403);
    expect(res.body.mensaje).toBe('Código de acceso inválido o sin usos disponibles.');
  });
});
