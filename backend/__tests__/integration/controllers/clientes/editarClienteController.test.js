const httpMocks = require('node-mocks-http');
const editarClienteController = require('@controllers/clientes/editarClienteController');
const Cliente = require('@models/Cliente');

jest.mock('@models/Cliente');

describe('🧪 [Integración] editarClienteController', () => {
  afterEach(() => jest.clearAllMocks());

  const baseCliente = {
    _id: 'cliente123',
    nombre: 'Cliente Original',
    dni: '12345678',
    telefono: '999999999',
    email: 'cliente@correo.com',
    estado: 'activo',
    calificacion: 'bueno',
  };

  it('✅ Edita cliente correctamente', async () => {
    Cliente.findOne = jest.fn().mockResolvedValue(null);
    Cliente.findByIdAndUpdate = jest.fn().mockResolvedValue({
      ...baseCliente,
      nombre: 'Nuevo Nombre',
    });

    const req = httpMocks.createRequest({
      method: 'PUT',
      params: { id: 'cliente123' },
      body: { nombre: 'Nuevo Nombre' },
    });
    const res = httpMocks.createResponse();

    await editarClienteController(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData().message).toBe('Cliente editado correctamente');
    expect(res._getJSONData().data.cliente.nombre).toBe('Nuevo Nombre');
  });

  it('❌ Rechaza si el cliente no existe', async () => {
    Cliente.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

    const req = httpMocks.createRequest({
      params: { id: 'noexiste' },
      body: { nombre: 'Otro Nombre' },
    });
    const res = httpMocks.createResponse();

    await editarClienteController(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(res._getJSONData().message).toBe('Cliente no encontrado');
  });

  it('❌ Rechaza estado inválido', async () => {
    const req = httpMocks.createRequest({
      params: { id: 'cliente123' },
      body: { estado: 'suspendido' },
    });
    const res = httpMocks.createResponse();

    Cliente.findByIdAndUpdate = jest.fn(() => {
      throw new Error('No puedes editar a un cliente con estado inválido');
    });

    await editarClienteController(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().message).toMatch(/estado/i);
  });

  it('❌ Rechaza calificación negativa', async () => {
    const req = httpMocks.createRequest({
      params: { id: 'cliente123' },
      body: { calificacion: 'muy_malo' },
    });
    const res = httpMocks.createResponse();

    Cliente.findByIdAndUpdate = jest.fn(() => {
      throw new Error('No puedes asignar una calificación negativa al cliente');
    });

    await editarClienteController(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().message).toMatch(/calificación/i);
  });

  it('❌ Rechaza dni duplicado', async () => {
    Cliente.findOne = jest.fn().mockResolvedValue({ _id: 'otroId' });

    const req = httpMocks.createRequest({
      params: { id: 'cliente123' },
      body: { dni: '88888888' },
    });
    const res = httpMocks.createResponse();

    Cliente.findByIdAndUpdate = jest.fn(() => {
      throw new Error('Ya existe otro cliente con ese DNI');
    });

    await editarClienteController(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().message).toMatch(/DNI/i);
  });

  it('❌ Rechaza email duplicado', async () => {
    Cliente.findOne = jest.fn().mockResolvedValue({ _id: 'otroId' });

    const req = httpMocks.createRequest({
      params: { id: 'cliente123' },
      body: { email: 'repetido@correo.com' },
    });
    const res = httpMocks.createResponse();

    Cliente.findByIdAndUpdate = jest.fn(() => {
      throw new Error('Ya existe otro cliente con ese correo');
    });

    await editarClienteController(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().message).toMatch(/correo/i);
  });

  it('❌ Rechaza teléfono duplicado', async () => {
    Cliente.findOne = jest.fn().mockResolvedValue({ _id: 'otroId' });

    const req = httpMocks.createRequest({
      params: { id: 'cliente123' },
      body: { telefono: '911111111' },
    });
    const res = httpMocks.createResponse();

    Cliente.findByIdAndUpdate = jest.fn(() => {
      throw new Error('Ya existe otro cliente con ese teléfono');
    });

    await editarClienteController(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().message).toMatch(/tel[eé]fono/i);
  });

  it('❌ Rechaza campo peligroso (XSS)', async () => {
    const req = httpMocks.createRequest({
      params: { id: 'cliente123' },
      body: { nombre: '<script>alert(1)</script>' },
    });
    const res = httpMocks.createResponse();

    Cliente.findByIdAndUpdate = jest.fn(() => {
      throw new Error('El campo nombre contiene caracteres no permitidos');
    });

    await editarClienteController(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().message).toMatch(/caracteres no permitidos/i);
  });
});
