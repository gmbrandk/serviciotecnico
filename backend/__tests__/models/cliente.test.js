const mongoose = require('mongoose');
const Cliente = require('@models/Cliente');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI_TEST);
});

afterEach(async () => {
  await Cliente.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Modelo Cliente', () => {
  it('debería crear un cliente válido', async () => {
    const cliente = new Cliente({
      nombre: 'Juan Pérez',
      dni: '12345678',
      telefono: '987654321',
      email: 'juan@example.com',
      direccion: 'Av. Siempre Viva 742',
    });

    const guardado = await cliente.save();
    expect(guardado.nombre).toBe('Juan Pérez');
    expect(guardado.estado).toBe('activo');
  });

  it('debería rechazar clientes con DNI duplicado', async () => {
    const cliente1 = new Cliente({ nombre: 'A', dni: '99999999' });
    await cliente1.save();

    const cliente2 = new Cliente({ nombre: 'B', dni: '99999999' });

    await expect(cliente2.save()).rejects.toThrow(/duplicate key/);
  });

  it('debería rechazar un estado inválido', async () => {
    const cliente = new Cliente({
      nombre: 'Invalido',
      dni: '88888888',
      estado: 'desconocido',
    });

    await expect(cliente.save()).rejects.toThrow(/is not a valid enum value/);
  });

  it('debería aceptar observaciones personalizadas', async () => {
    const cliente = new Cliente({
      nombre: 'Carlos',
      dni: '77777777',
      observaciones: 'Buen cliente con historial excelente',
    });

    const guardado = await cliente.save();
    expect(guardado.observaciones).toMatch(/Buen cliente/);
  });
});
