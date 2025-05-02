const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app'); // tu archivo modularizado
const Usuario = require('../../models/Usuario');
const CodigoAcceso = require('../../models/CodigoAcceso');

beforeAll(async () => {
  const uri = process.env.MONGODB_URI_TEST;
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

afterEach(async () => {
  await Usuario.deleteMany({});
  await CodigoAcceso.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('POST /api/auth/register', () => {
  it('debería registrar un usuario técnico con código válido', async () => {
    // Crear un código de acceso
    const codigo = await CodigoAcceso.create({
      codigo: 'TESTCODE',
      usosDisponibles: 2,
      creadoPor: new mongoose.Types.ObjectId(),
      estado: 'activo'
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        nombre: 'testuser',
        email: 'test@example.com',
        password: '12345678',
        role: 'tecnico',
        codigoAcceso: codigo.codigo
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.mensaje).toBe('Usuario registrado con éxito');

    const usuario = await Usuario.findOne({ email: 'test@example.com' });
    expect(usuario).not.toBeNull();
    expect(usuario.role).toBe('tecnico');

    const codigoActualizado = await CodigoAcceso.findOne({ codigo: 'TESTCODE' });
    expect(codigoActualizado.usosDisponibles).toBe(1);
  });

  it('debería rechazar con código inválido o sin usos', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        nombre: 'user2',
        email: 'user2@example.com',
        password: '12345678',
        role: 'tecnico',
        codigoAcceso: 'INVALID'
      });

    expect(res.status).toBe(403);
    expect(res.body.mensaje).toBe('Código de acceso inválido o sin usos disponibles.');
  });

  it('debería rechazar si el correo ya está en uso', async () => {
    const codigo = await CodigoAcceso.create({
      codigo: 'DUPLICAT',
      usosDisponibles: 2,
      creadoPor: new mongoose.Types.ObjectId(),
      estado: 'activo'
    });

    await Usuario.create({
      nombre: 'existente',
      email: 'existente@example.com',
      password: '1234',
      role: 'tecnico'
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        nombre: 'nuevo',
        email: 'existente@example.com',
        password: '12345678',
        role: 'tecnico',
        codigoAcceso: 'DUPLICAT'
      });

    expect(res.status).toBe(400);
    expect(res.body.mensaje).toBe('El correo ya está registrado.');
  });
});
