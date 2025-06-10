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

  it('❌ Rechaza cliente con campo "estado" no permitido', async () => {
    const req = httpMocks.createRequest({
      body: { ...baseBody, estado: 'suspendido' },
    });
    const res = httpMocks.createResponse();

    await crearClienteController(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().message).toBe(
      'Los siguientes campos no están permitidos: estado'
    );
  });

  it('❌ Rechaza cliente con campo "calificacion" no permitido', async () => {
    const req = httpMocks.createRequest({
      body: { ...baseBody, calificacion: 'muy_malo' },
    });
    const res = httpMocks.createResponse();

    await crearClienteController(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().message).toBe(
      'Los siguientes campos no están permitidos: calificacion'
    );
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
      'El campo observaciones contiene caracteres no permitidos'
    );
  });

  it('❌ Rechaza campos no permitidos como fechaRegistro y estado', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      url: '/clientes',
      body: {
        nombre: 'Carlos',
        dni: '99999999',
        telefono: '999999999',
        fechaRegistro: '2022-01-01T00:00:00Z',
        estado: 'inactivo',
      },
    });
    const res = httpMocks.createResponse();

    await crearClienteController(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().message).toMatch(/campos no están permitidos/i);
  });
});
