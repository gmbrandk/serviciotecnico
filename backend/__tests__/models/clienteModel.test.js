// __tests__/models/ClienteModel.test.js
const mongoose = require('mongoose');
const Cliente = require('@models/Cliente');

describe('Modelo Cliente - Validaciones', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterEach(async () => {
    await Cliente.deleteMany();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('debería guardar un cliente válido con calificación por defecto', async () => {
    const cliente = new Cliente({
      nombre: 'Carlos Pérez',
      dni: '12345678',
      telefono: '987654321',
      email: 'carlos@example.com',
      direccion: 'Av. Los Álamos 123',
    });

    const guardado = await cliente.save();
    expect(guardado.calificacion).toBe('regular');
    expect(guardado.estado).toBe('activo');
  });

  it('debería fallar con una calificación inválida', async () => {
    const cliente = new Cliente({
      nombre: 'Ana García',
      dni: '87654321',
      calificacion: 'excelente', // no es parte del enum
    });

    await expect(cliente.save()).rejects.toThrow(
      '`excelente` is not a valid enum value for path `calificacion`'
    );
  });

  it('debería permitir guardar con calificación "bueno"', async () => {
    const cliente = new Cliente({
      nombre: 'Lucía Ríos',
      dni: '45678912',
      calificacion: 'bueno',
    });

    const guardado = await cliente.save();
    expect(guardado.calificacion).toBe('bueno');
  });
});
