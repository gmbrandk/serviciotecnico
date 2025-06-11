const httpMocks = require('node-mocks-http');
const mongoose = require('mongoose');
const editarClienteController = require('@controllers/clientes/editarClienteController');
const Cliente = require('@models/Cliente');

jest.mock('@models/Cliente');

describe('🧪 editarClienteController (integrado)', () => {
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

  it('✅ Edita cliente correctamente con nombre y observaciones', async () => {
    Cliente.findById = jest.fn().mockResolvedValue({ ...clienteMock });
    Cliente.findOne = jest.fn().mockResolvedValue(null);
    Cliente.findByIdAndUpdate = jest.fn().mockResolvedValue({
      ...clienteMock,
      nombre: 'Nuevo Nombre',
      observaciones: 'Observación actualizada',
    });

    const req = httpMocks.createRequest({
      method: 'PUT',
      params: { id: idValido },
      body: {
        nombre: 'Nuevo Nombre',
        observaciones: 'Observación actualizada',
      },
    });
    const res = httpMocks.createResponse();

    await editarClienteController(req, res);

    const data = res._getJSONData();
    expect(res._getStatusCode()).toBe(200);
    expect(data.message).toBe('Cliente editado correctamente');
    expect(data.details.cliente.nombre).toBe('Nuevo Nombre');
  });

  it('❌ Rechaza ID inválido', async () => {
    const req = httpMocks.createRequest({
      method: 'PUT',
      params: { id: '123' },
      body: { nombre: 'Test' },
    });
    const res = httpMocks.createResponse();

    await editarClienteController(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().message).toBe('ID inválido');
  });

  it('❌ Rechaza campos no permitidos', async () => {
    const req = httpMocks.createRequest({
      method: 'PUT',
      params: { id: idValido },
      body: { nombre: 'Test', rol: 'admin' },
    });
    const res = httpMocks.createResponse();

    await editarClienteController(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().message).toMatch(/no están permitidos/i);
  });

  it('❌ Rechaza campo con etiquetas peligrosas (XSS)', async () => {
    const req = httpMocks.createRequest({
      method: 'PUT',
      params: { id: idValido },
      body: { nombre: '<script>alert(1)</script>' },
    });
    const res = httpMocks.createResponse();

    await editarClienteController(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().message).toMatch(/caracteres no permitidos/i);
  });

  it('❌ Rechaza formato de correo inválido', async () => {
    const req = httpMocks.createRequest({
      method: 'PUT',
      params: { id: idValido },
      body: { email: 'correo_invalido' },
    });
    const res = httpMocks.createResponse();

    await editarClienteController(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().message).toBe(
      'El correo tiene un formato inválido'
    );
  });

  it('❌ Rechaza intento de cambiar el DNI', async () => {
    Cliente.findById = jest.fn().mockResolvedValue({ ...clienteMock });

    const req = httpMocks.createRequest({
      method: 'PUT',
      params: { id: idValido },
      body: { dni: '88888888' },
    });
    const res = httpMocks.createResponse();

    await editarClienteController(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().message).toBe(
      'No está permitido cambiar el DNI del cliente'
    );
  });

  it('❌ Rechaza estado inválido', async () => {
    Cliente.findById = jest.fn().mockResolvedValue({ ...clienteMock });

    const req = httpMocks.createRequest({
      method: 'PUT',
      params: { id: idValido },
      body: { estado: 'baneado' },
    });
    const res = httpMocks.createResponse();

    await editarClienteController(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().message).toBe(
      'No puedes asignar un estado inválido al cliente'
    );
  });

  it('❌ Rechaza calificación negativa', async () => {
    Cliente.findById = jest.fn().mockResolvedValue({ ...clienteMock });

    const req = httpMocks.createRequest({
      method: 'PUT',
      params: { id: idValido },
      body: { calificacion: 'muy_malo' },
    });
    const res = httpMocks.createResponse();

    await editarClienteController(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().message).toBe(
      'No puedes asignar una calificación negativa al cliente'
    );
  });

  it('❌ Rechaza email duplicado', async () => {
    Cliente.findById = jest.fn().mockResolvedValue({ ...clienteMock });
    Cliente.findOne = jest.fn().mockResolvedValue({ _id: 'otroId' });

    const req = httpMocks.createRequest({
      method: 'PUT',
      params: { id: idValido },
      body: { email: 'otro@correo.com' },
    });
    const res = httpMocks.createResponse();

    await editarClienteController(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().message).toBe(
      'Ya existe un cliente con ese correo'
    );
  });

  it('❌ Rechaza teléfono duplicado', async () => {
    Cliente.findById = jest.fn().mockResolvedValue({ ...clienteMock });
    Cliente.findOne = jest.fn().mockResolvedValue({ _id: 'otroId' });

    const req = httpMocks.createRequest({
      method: 'PUT',
      params: { id: idValido },
      body: { telefono: '911111111' },
    });
    const res = httpMocks.createResponse();

    await editarClienteController(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().message).toBe(
      'Ya existe un cliente con ese teléfono'
    );
  });

  it('❌ Devuelve error si cliente no existe', async () => {
    Cliente.findById = jest.fn().mockResolvedValue(null);

    const req = httpMocks.createRequest({
      method: 'PUT',
      params: { id: idValido },
      body: { nombre: 'Nuevo Nombre' },
    });
    const res = httpMocks.createResponse();

    await editarClienteController(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(res._getJSONData().message).toBe('Cliente no encontrado');
  });
});
