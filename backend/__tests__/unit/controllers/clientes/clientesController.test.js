// __tests__/unit/controllers/clientes/clientesController.test.js

const httpMocks = require('node-mocks-http');

const obtenerClientePorIdController = require('@controllers/clientes/obtenerClientePorIdController');
const obtenerClientesController = require('@controllers/clientes/obtenerClientesController');
const crearClienteController = require('@controllers/clientes/crearClienteController');
const editarClienteController = require('@controllers/clientes/editarClienteController');
const eliminarClienteController = require('@controllers/clientes/eliminarClienteController');

jest.mock('@services/clientes/obtenerClientePorIdService');
jest.mock('@services/clientes/obtenerClientesService');
jest.mock('@services/clientes/crearClienteService');
jest.mock('@services/clientes/editarClienteService');
jest.mock('@services/clientes/eliminarClienteService');

const obtenerClientePorIdService = require('@services/clientes/obtenerClientePorIdService');
const obtenerClientesService = require('@services/clientes/obtenerClientesService');
const crearClienteService = require('@services/clientes/crearClienteService');
const editarClienteService = require('@services/clientes/editarClienteService');
const eliminarClienteService = require('@services/clientes/eliminarClienteService');

describe('🧪 Controladores de Cliente', () => {
  afterEach(() => jest.clearAllMocks());

  it('📌 obtenerClientePorIdController devuelve cliente correctamente', async () => {
    const req = httpMocks.createRequest({ params: { id: '123' } });
    const res = httpMocks.createResponse();
    const mockCliente = { nombre: 'Cliente Test' };
    obtenerClientePorIdService.mockResolvedValue(mockCliente);

    await obtenerClientePorIdController(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({
      success: true,
      ok: true,
      message: 'Cliente obtenido correctamente',
      mensaje: 'Cliente obtenido correctamente',
      details: {
        cliente: mockCliente,
      },
    });
  });

  it('📌 obtenerClientesController devuelve lista de clientes', async () => {
    const req = httpMocks.createRequest({ query: { estado: 'activo' } });
    const res = httpMocks.createResponse();
    const mockClientes = [{ nombre: 'Ana' }];
    obtenerClientesService.mockResolvedValue(mockClientes);

    await obtenerClientesController(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({
      success: true,
      ok: true,
      message: 'Clientes obtenidos correctamente',
      mensaje: 'Clientes obtenidos correctamente',
      details: {
        clientes: mockClientes,
      },
    });
  });

  it('📌 crearClienteController responde con cliente creado', async () => {
    const req = httpMocks.createRequest({ body: { nombre: 'Nuevo' } });
    const res = httpMocks.createResponse();
    const mockCliente = { nombre: 'Nuevo' };
    crearClienteService.mockResolvedValue(mockCliente);

    await crearClienteController(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(res._getJSONData()).toEqual({
      success: true,
      ok: true,
      message: 'Cliente creado correctamente',
      mensaje: 'Cliente creado correctamente',
      details: {
        cliente: mockCliente,
      },
    });
  });

  it('📌 editarClienteController responde con cliente actualizado', async () => {
    const req = httpMocks.createRequest({
      params: { id: 'abc' },
      body: { nombre: 'Editado' },
    });
    const res = httpMocks.createResponse();
    const mockCliente = { nombre: 'Editado' };
    editarClienteService.mockResolvedValue(mockCliente);

    await editarClienteController(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({
      success: true,
      ok: true,
      message: 'Cliente editado correctamente',
      mensaje: 'Cliente editado correctamente',
      details: {
        cliente: mockCliente,
      },
    });
  });

  it('📌 eliminarClienteController responde correctamente', async () => {
    const req = httpMocks.createRequest({ params: { id: 'del' } });
    const res = httpMocks.createResponse();
    eliminarClienteService.mockResolvedValue(true);

    await eliminarClienteController(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({
      success: true,
      ok: true,
      message: 'Cliente eliminado correctamente',
      mensaje: 'Cliente eliminado correctamente',
      details: {
        cliente: true,
      },
    });
  });

  // 🔴 Errores

  it('📛 obtenerClientePorIdController responde 404 si cliente no existe', async () => {
    const req = httpMocks.createRequest({ params: { id: 'noexiste' } });
    const res = httpMocks.createResponse();
    obtenerClientePorIdService.mockRejectedValue(
      new Error('Cliente no encontrado')
    );

    await obtenerClientePorIdController(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(res._getJSONData()).toEqual({
      success: false,
      ok: false,
      message: 'Cliente no encontrado',
      mensaje: 'Cliente no encontrado',
    });
  });

  it('📛 obtenerClientesController responde 500 en error inesperado', async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    obtenerClientesService.mockRejectedValue(new Error('Error inesperado'));

    await obtenerClientesController(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData()).toEqual({
      success: false,
      ok: false,
      message: 'Error inesperado',
      mensaje: 'Error inesperado',
    });
  });

  it('📛 crearClienteController responde 400 si hay error de validación', async () => {
    const req = httpMocks.createRequest({ body: {} });
    const res = httpMocks.createResponse();
    crearClienteService.mockRejectedValue(new Error('Nombre es requerido'));

    await crearClienteController(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toEqual({
      success: false,
      ok: false,
      message: 'Nombre es requerido',
      mensaje: 'Nombre es requerido',
    });
  });

  it('📛 editarClienteController responde 404 si cliente no existe', async () => {
    const req = httpMocks.createRequest({ params: { id: 'x' }, body: {} });
    const res = httpMocks.createResponse();
    editarClienteService.mockRejectedValue(new Error('Cliente no encontrado'));

    await editarClienteController(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(res._getJSONData()).toEqual({
      success: false,
      ok: false,
      message: 'Cliente no encontrado',
      mensaje: 'Cliente no encontrado',
    });
  });

  it('📛 eliminarClienteController responde 404 si cliente no existe', async () => {
    const req = httpMocks.createRequest({ params: { id: 'x' } });
    const res = httpMocks.createResponse();
    eliminarClienteService.mockRejectedValue(
      new Error('Cliente no encontrado')
    );

    await eliminarClienteController(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(res._getJSONData()).toEqual({
      success: false,
      ok: false,
      message: 'Cliente no encontrado',
      mensaje: 'Cliente no encontrado',
    });
  });
});
