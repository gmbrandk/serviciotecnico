const httpMocks = require('node-mocks-http');
const crearClienteController = require('@controllers/clientes/crearClienteController');
const Cliente = require('@models/Cliente');

jest.mock('@models/Cliente');

describe('🧪 [Integración] crearClienteController', () => {
  afterEach(() => jest.clearAllMocks());

  it('✅ Crea cliente correctamente', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: {
        nombre: 'Cliente Nuevo',
        dni: '12345678',
        telefono: '999999999',
        email: 'cliente@correo.com',
      },
    });

    const res = httpMocks.createResponse();

    // No hay duplicados
    Cliente.findOne = jest.fn().mockResolvedValue(null);

    // Simular save exitoso
    Cliente.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue({ nombre: 'Cliente Nuevo' }),
    }));

    await crearClienteController(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(res._getJSONData()).toEqual({
      success: true,
      ok: true,
      message: 'Cliente creado correctamente',
      mensaje: 'Cliente creado correctamente',
      details: {
        cliente: { nombre: 'Cliente Nuevo' },
      },
    });
  });

  it('❌ Rechaza cliente con estado inválido', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: {
        nombre: 'Mal Cliente',
        dni: '22222222',
        telefono: '912345678',
        estado: 'suspendido',
      },
    });

    const res = httpMocks.createResponse();

    Cliente.findOne = jest.fn().mockResolvedValue(null);
    Cliente.mockImplementation(() => ({
      save: jest.fn(), // nunca se debe ejecutar
    }));

    await crearClienteController(req, res);

    expect(res._getStatusCode()).toBe(500); // El service lanza error -> catch
    expect(res._getJSONData().success).toBe(false);
    expect(res._getJSONData().message).toBe('Error al crear el cliente');
  });

  it('❌ Rechaza cliente con calificación muy_malo', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: {
        nombre: 'Otro Cliente',
        dni: '88888888',
        telefono: '900111222',
        calificacion: 'muy_malo',
      },
    });

    const res = httpMocks.createResponse();

    Cliente.findOne = jest.fn().mockResolvedValue(null);
    Cliente.mockImplementation(() => ({
      save: jest.fn(),
    }));

    await crearClienteController(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData().success).toBe(false);
    expect(res._getJSONData().message).toBe('Error al crear el cliente');
  });
});
