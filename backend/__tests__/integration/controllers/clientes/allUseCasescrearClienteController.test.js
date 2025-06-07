const httpMocks = require('node-mocks-http');
const crearClienteController = require('@controllers/clientes/crearClienteController');
const Cliente = require('@models/Cliente');

jest.mock('@models/Cliente');

describe('🧪 [Integración] crearClienteController', () => {
  afterEach(() => jest.clearAllMocks());

  const baseBody = {
    nombre: 'Cliente Nuevo',
    dni: '12345678',
    telefono: '999999999',
    email: 'cliente@correo.com',
  };

  it('✅ Crea cliente correctamente', async () => {
    const req = httpMocks.createRequest({ method: 'POST', body: baseBody });
    const res = httpMocks.createResponse();

    Cliente.findOne = jest.fn().mockResolvedValue(null);
    Cliente.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue({ nombre: 'Cliente Nuevo' }),
    }));

    await crearClienteController(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(res._getJSONData()).toMatchObject({
      success: true,
      ok: true,
      message: 'Cliente creado correctamente',
      mensaje: 'Cliente creado correctamente',
    });
  });

  it('❌ Falla si falta nombre, dni o telefono', async () => {
    const req = httpMocks.createRequest({
      body: { dni: '123', telefono: '999' },
    });
    const res = httpMocks.createResponse();

    await crearClienteController(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().message).toBe(
      'Nombre, DNI y Teléfono son obligatorios'
    );
  });

  it('❌ Rechaza cliente con estado inválido', async () => {
    const req = httpMocks.createRequest({
      body: { ...baseBody, estado: 'suspendido' },
    });
    const res = httpMocks.createResponse();

    Cliente.findOne = jest.fn().mockResolvedValue(null);
    Cliente.mockImplementation(() => ({
      save: jest.fn(),
    }));

    await crearClienteController(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData().message).toBe('Error al crear el cliente');
  });

  it('❌ Rechaza cliente con calificación inválida', async () => {
    const req = httpMocks.createRequest({
      body: { ...baseBody, calificacion: 'muy_malo' },
    });
    const res = httpMocks.createResponse();

    Cliente.findOne = jest.fn().mockResolvedValue(null);
    Cliente.mockImplementation(() => ({
      save: jest.fn(),
    }));

    await crearClienteController(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData().message).toBe('Error al crear el cliente');
  });

  it('❌ Rechaza cliente con email duplicado', async () => {
    const req = httpMocks.createRequest({ body: baseBody });
    const res = httpMocks.createResponse();

    Cliente.findOne = jest
      .fn()
      .mockResolvedValueOnce(null) // DNI ok
      .mockResolvedValueOnce({ email: 'cliente@correo.com' }); // Email duplicado

    await crearClienteController(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().message).toBe(
      'Ya existe un cliente con ese correo'
    );
  });

  it('❌ Rechaza cliente con email inválido', async () => {
    const req = httpMocks.createRequest({
      body: { ...baseBody, email: 'correo_invalido' },
    });
    const res = httpMocks.createResponse();

    Cliente.findOne = jest.fn().mockResolvedValue(null);

    await crearClienteController(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().message).toBe(
      'El correo tiene un formato inválido'
    );
  });

  it('❌ Rechaza cliente con teléfono duplicado', async () => {
    const req = httpMocks.createRequest({ body: baseBody });
    const res = httpMocks.createResponse();

    Cliente.findOne = jest
      .fn()
      .mockResolvedValueOnce(null) // DNI
      .mockResolvedValueOnce(null) // Email
      .mockResolvedValueOnce({ telefono: '999999999' }); // Teléfono duplicado

    await crearClienteController(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().message).toBe(
      'Ya existe un cliente con ese teléfono'
    );
  });

  it('❌ Rechaza cliente con observaciones peligrosas XXS', async () => {
    const req = httpMocks.createRequest({
      body: { ...baseBody, observaciones: '<script>alert(1)</script>' },
    });
    const res = httpMocks.createResponse();

    Cliente.findOne = jest.fn().mockResolvedValue(null);

    await crearClienteController(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().message).toBe(
      'Las observaciones contienen contenido no permitido'
    );
  });
});
