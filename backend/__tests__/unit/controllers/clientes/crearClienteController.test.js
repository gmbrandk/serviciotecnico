const httpMocks = require('node-mocks-http');
const crearClienteController = require('@controllers/clientes/crearClienteController');
const crearClienteService = require('@services/clientes/crearClienteService');
const Cliente = require('@models/Cliente');

jest.mock('@services/clientes/crearClienteService');
jest.mock('@models/Cliente');

describe('🧪 crearClienteController', () => {
  afterEach(() => jest.clearAllMocks());

  it('✅ Crea un cliente correctamente', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: {
        nombre: 'Juan',
        dni: '12345678',
        telefono: '999999999',
        email: 'juan@correo.com',
        observaciones: 'Todo bien',
      },
    });
    const res = httpMocks.createResponse();

    Cliente.findOne.mockResolvedValue(null); // No hay duplicados
    crearClienteService.mockResolvedValue({ nombre: 'Juan' });

    await crearClienteController(req, res);

    const data = res._getJSONData();
    expect(res._getStatusCode()).toBe(201);
    expect(data.success).toBe(true);
    expect(data.mensaje).toBe('Cliente creado correctamente');
    expect(data.details.cliente).toEqual({ nombre: 'Juan' });
  });

  it('❌ Error si falta nombre, dni o teléfono', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: { nombre: 'Juan' }, // faltan dni y telefono
    });
    const res = httpMocks.createResponse();

    await crearClienteController(req, res);

    const data = res._getJSONData();
    expect(res._getStatusCode()).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toMatch(/Nombre, DNI y Teléfono son obligatorios/i);
  });

  it('❌ Error si el DNI ya existe', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: {
        nombre: 'Ana',
        dni: '11111111',
        telefono: '900000000',
      },
    });
    const res = httpMocks.createResponse();

    Cliente.findOne.mockImplementation(({ dni }) =>
      dni === '11111111' ? Promise.resolve({}) : Promise.resolve(null)
    );

    await crearClienteController(req, res);

    const data = res._getJSONData();
    expect(res._getStatusCode()).toBe(400);
    expect(data.message).toMatch(/ya existe un cliente con ese DNI/i);
  });

  it('❌ Error si el correo tiene formato inválido', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: {
        nombre: 'Ana',
        dni: '22222222',
        telefono: '900000000',
        email: 'correo-no-valido',
      },
    });
    const res = httpMocks.createResponse();

    Cliente.findOne.mockResolvedValue(null);

    await crearClienteController(req, res);

    const data = res._getJSONData();
    expect(res._getStatusCode()).toBe(400);
    expect(data.message).toMatch(/correo tiene un formato inválido/i);
  });

  it('❌ Error si las observaciones contienen XSS', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: {
        nombre: 'Pedro',
        dni: '33333333',
        telefono: '900000000',
        observaciones: '<script>alert(1)</script>',
      },
    });
    const res = httpMocks.createResponse();

    Cliente.findOne.mockResolvedValue(null);

    await crearClienteController(req, res);

    const data = res._getJSONData();
    expect(res._getStatusCode()).toBe(400);
    expect(data.message).toMatch(
      /observaciones contienen contenido no permitido/i
    );
  });

  it('❌ Error interno del servicio', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: {
        nombre: 'Luis',
        dni: '44444444',
        telefono: '911111111',
      },
    });
    const res = httpMocks.createResponse();

    Cliente.findOne.mockResolvedValue(null);
    crearClienteService.mockRejectedValue(new Error('Falló la BD'));

    await crearClienteController(req, res);

    const data = res._getJSONData();
    expect(res._getStatusCode()).toBe(500);
    expect(data.message).toMatch(/error al crear el cliente/i);
  });
});
