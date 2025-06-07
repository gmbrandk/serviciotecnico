const crearClienteService = require('@services/clientes/crearClienteService');
const Cliente = require('@models/Cliente');

jest.mock('@models/Cliente');

describe('🧪 crearClienteService', () => {
  afterEach(() => jest.clearAllMocks());

  it('✅ Crea cliente exitosamente con datos válidos', async () => {
    const data = {
      nombre: 'Pedro',
      dni: '12345678',
      telefono: '999999999',
      estado: 'activo', // permitido
      calificacion: 'bueno', // permitido
    };

    const mockSave = jest.fn().mockResolvedValue(data);
    Cliente.mockImplementation(() => ({ save: mockSave }));

    const resultado = await crearClienteService(data);

    expect(mockSave).toHaveBeenCalled();
    expect(resultado).toEqual(data);
  });

  it('❌ Rechaza creación con estado suspendido', async () => {
    const data = {
      nombre: 'Ana',
      dni: '87654321',
      telefono: '900000000',
      estado: 'suspendido',
    };

    await expect(crearClienteService(data)).rejects.toThrow(
      'No puedes crear un cliente con estado suspendido o baneado'
    );
  });

  it('❌ Rechaza creación con estado baneado', async () => {
    const data = {
      nombre: 'Ana',
      dni: '87654321',
      telefono: '900000000',
      estado: 'baneado',
    };

    await expect(crearClienteService(data)).rejects.toThrow(
      'No puedes crear un cliente con estado suspendido o baneado'
    );
  });

  it('❌ Rechaza creación con calificación muy_malo', async () => {
    const data = {
      nombre: 'Carlos',
      dni: '77777777',
      telefono: '955555555',
      calificacion: 'muy_malo',
    };

    await expect(crearClienteService(data)).rejects.toThrow(
      'No puedes crear un cliente con calificación mala o muy mala'
    );
  });

  it('❌ Rechaza creación con calificación malo', async () => {
    const data = {
      nombre: 'Carlos',
      dni: '77777777',
      telefono: '955555555',
      calificacion: 'malo',
    };

    await expect(crearClienteService(data)).rejects.toThrow(
      'No puedes crear un cliente con calificación mala o muy mala'
    );
  });
});
