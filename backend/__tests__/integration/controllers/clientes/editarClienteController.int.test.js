const httpMocks = require('node-mocks-http');
const mongoose = require('mongoose');
const editarClienteController = require('@controllers/clientes/editarClienteController');
const Cliente = require('@models/Cliente');

jest.mock('@models/Cliente');

describe('🧪 [Integración] editarClienteController', () => {
  afterEach(() => jest.clearAllMocks());

  const idValido = new mongoose.Types.ObjectId().toHexString();

  const baseCliente = {
    _id: idValido,
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
      params: { id: idValido },
      body: { nombre: 'Nuevo Nombre' },
    });
    const res = httpMocks.createResponse();

    await editarClienteController(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData().message).toBe('Cliente editado correctamente');
    expect(res._getJSONData().details.cliente.nombre).toBe('Nuevo Nombre');
  });

  it('❌ Rechaza si el cliente no existe', async () => {
    Cliente.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

    const req = httpMocks.createRequest({
      params: { id: idValido },
      body: { nombre: 'Otro Nombre' },
    });
    const res = httpMocks.createResponse();

    await editarClienteController(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(res._getJSONData().message).toBe('Cliente no encontrado');
  });

  it('❌ Rechaza estado inválido', async () => {
    Cliente.findByIdAndUpdate = jest.fn(() => {
      throw new Error('No puedes asignar un estado inválido al cliente');
    });

    const req = httpMocks.createRequest({
      params: { id: idValido },
      body: { estado: 'suspendido' },
    });
    const res = httpMocks.createResponse();

    await editarClienteController(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().message).toBe(
      'No puedes asignar un estado inválido al cliente'
    );
  });

  it('❌ Rechaza calificación negativa', async () => {
    Cliente.findByIdAndUpdate = jest.fn(() => {
      throw new Error('No puedes asignar una calificación negativa al cliente');
    });

    const req = httpMocks.createRequest({
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

  it('❌ Rechaza dni duplicado', async () => {
    Cliente.findOne = jest.fn().mockResolvedValue({ _id: 'otroId' });
    Cliente.findByIdAndUpdate = jest.fn(() => {
      throw new Error('Ya existe un cliente con ese DNI');
    });

    const req = httpMocks.createRequest({
      params: { id: idValido },
      body: { dni: '88888888' },
    });
    const res = httpMocks.createResponse();

    await editarClienteController(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().message).toBe('Ya existe un cliente con ese DNI');
  });

  it('❌ Rechaza email duplicado', async () => {
    Cliente.findOne = jest.fn().mockResolvedValue({ _id: 'otroId' });
    Cliente.findByIdAndUpdate = jest.fn(() => {
      throw new Error('Ya existe un cliente con ese correo');
    });

    const req = httpMocks.createRequest({
      params: { id: idValido },
      body: { email: 'repetido@correo.com' },
    });
    const res = httpMocks.createResponse();

    await editarClienteController(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().message).toBe(
      'Ya existe un cliente con ese correo'
    );
  });

  it('❌ Rechaza teléfono duplicado', async () => {
    Cliente.findOne = jest.fn().mockResolvedValue({ _id: 'otroId' });
    Cliente.findByIdAndUpdate = jest.fn(() => {
      throw new Error('Ya existe un cliente con ese teléfono');
    });

    const req = httpMocks.createRequest({
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

  it('❌ Rechaza campo peligroso (XSS)', async () => {
    Cliente.findByIdAndUpdate = jest.fn(() => {
      throw new Error('El campo nombre contiene caracteres no permitidos');
    });

    const req = httpMocks.createRequest({
      params: { id: idValido },
      body: { nombre: '<script>alert(1)</script>' },
    });
    const res = httpMocks.createResponse();

    await editarClienteController(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().message).toMatch(/caracteres no permitidos/i);
  });

  it('❌ Rechaza intento de modificar el DNI existente', async () => {
    Cliente.findById = jest.fn().mockResolvedValue({ ...baseCliente });

    Cliente.findByIdAndUpdate = jest.fn(() => {
      throw new Error('No puedes modificar el DNI del cliente');
    });

    const req = httpMocks.createRequest({
      params: { id: idValido },
      body: { dni: '99999999' }, // intento de cambiar el DNI
    });
    const res = httpMocks.createResponse();

    await editarClienteController(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().message).toBe(
      'No puedes modificar el DNI del cliente'
    );
  });
});
