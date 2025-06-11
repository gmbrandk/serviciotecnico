const mongoose = require('mongoose');
const editarClienteService = require('@services/clientes/editarClienteService');
const Cliente = require('@models/Cliente');

jest.mock('@models/Cliente');

describe('🧪 editarClienteService (unitario)', () => {
  afterEach(() => jest.clearAllMocks());

  const idValido = new mongoose.Types.ObjectId().toHexString();

  const clienteMock = {
    _id: idValido,
    nombre: 'Cliente Uno',
    dni: '12345678',
    telefono: '999999999',
    email: 'cliente@correo.com',
    observaciones: '',
    estado: 'activo',
    calificacion: 'bueno',
  };

  it('✅ Actualiza cliente correctamente (sin DNI)', async () => {
    Cliente.findById.mockResolvedValue({ ...clienteMock });
    Cliente.findOne.mockResolvedValue(null);
    Cliente.findByIdAndUpdate.mockResolvedValue({
      ...clienteMock,
      nombre: 'Nuevo Nombre',
    });

    const resultado = await editarClienteService(idValido, {
      nombre: 'Nuevo Nombre',
    });

    expect(resultado.nombre).toBe('Nuevo Nombre');
    expect(Cliente.findByIdAndUpdate).toHaveBeenCalledWith(
      idValido,
      expect.not.objectContaining({ dni: expect.any(String) }),
      { new: true }
    );
  });

  it('❌ Lanza error si cliente no existe', async () => {
    Cliente.findById.mockResolvedValue(null);

    await expect(
      editarClienteService(idValido, { nombre: 'Nuevo' })
    ).rejects.toThrow('Cliente no encontrado');
  });

  it('❌ Lanza error si se intenta cambiar el DNI', async () => {
    Cliente.findById.mockResolvedValue({ ...clienteMock });

    await expect(
      editarClienteService(idValido, { dni: '99999999' })
    ).rejects.toThrow('No está permitido cambiar el DNI del cliente');
  });

  it('❌ Lanza error si estado es "suspendido"', async () => {
    Cliente.findById.mockResolvedValue({ ...clienteMock });

    await expect(
      editarClienteService(idValido, { estado: 'suspendido' })
    ).rejects.toThrow('No puedes asignar un estado inválido al cliente');
  });

  it('❌ Lanza error si calificación es "muy_malo"', async () => {
    Cliente.findById.mockResolvedValue({ ...clienteMock });

    await expect(
      editarClienteService(idValido, { calificacion: 'muy_malo' })
    ).rejects.toThrow('No puedes asignar una calificación negativa al cliente');
  });

  it('❌ Lanza error si el email ya existe en otro cliente', async () => {
    Cliente.findById.mockResolvedValue({ ...clienteMock });
    Cliente.findOne.mockResolvedValue({ _id: 'otroId' });

    await expect(
      editarClienteService(idValido, { email: 'otro@correo.com' })
    ).rejects.toThrow('Ya existe un cliente con ese correo');
  });

  it('❌ Lanza error si el teléfono ya existe en otro cliente', async () => {
    Cliente.findById.mockResolvedValue({ ...clienteMock });
    Cliente.findOne.mockResolvedValue({ _id: 'otroId' });

    await expect(
      editarClienteService(idValido, { telefono: '911111111' })
    ).rejects.toThrow('Ya existe un cliente con ese teléfono');
  });

  it('❌ Lanza error si cliente no se encuentra al actualizar', async () => {
    Cliente.findById.mockResolvedValue({ ...clienteMock });
    Cliente.findOne.mockResolvedValue(null);
    Cliente.findByIdAndUpdate.mockResolvedValue(null);

    await expect(
      editarClienteService(idValido, { nombre: 'X' })
    ).rejects.toThrow('Cliente no encontrado');
  });
});
