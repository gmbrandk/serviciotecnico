jest.mock('../../../../services/clientes/obtenerClientesService');

const obtenerClientesController = require('../../../../controllers/clientes/obtenerClientesController');
const obtenerClientesService = require('../../../../services/clientes/obtenerClientesService');

const buildRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
});

describe('obtenerClientesController', () => {
  const mockClientes = [{ nombre: 'Cliente A' }, { nombre: 'Cliente B' }];
  const totalClientes = mockClientes.length;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('✅ responde sin filtros', async () => {
    const req = { query: {} };
    const res = buildRes();

    obtenerClientesService.mockResolvedValue({
      clientes: mockClientes,
      total: totalClientes,
    });

    await obtenerClientesController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      ok: true,
      message: 'Clientes obtenidos',
      mensaje: 'Clientes obtenidos',
      details: {
        clientes: mockClientes,
        total: totalClientes,
      },
    });
  });

  it('🔍 responde filtrando por nombre', async () => {
    const req = { query: { nombre: 'Cliente' } };
    const res = buildRes();

    obtenerClientesService.mockResolvedValue({
      clientes: mockClientes,
      total: totalClientes,
    });

    await obtenerClientesController(req, res);

    expect(obtenerClientesService).toHaveBeenCalledWith({
      filtros: { nombre: expect.any(RegExp) },
      opciones: {
        page: undefined,
        limit: undefined,
        sortBy: undefined,
        order: undefined,
      },
    });

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('🔍 responde filtrando por estado', async () => {
    const req = { query: { estado: 'activo' } };
    const res = buildRes();

    obtenerClientesService.mockResolvedValue({
      clientes: mockClientes,
      total: totalClientes,
    });

    await obtenerClientesController(req, res);

    expect(obtenerClientesService).toHaveBeenCalledWith({
      filtros: { estado: 'activo' },
      opciones: {
        page: undefined,
        limit: undefined,
        sortBy: undefined,
        order: undefined,
      },
    });

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('🔍 responde filtrando por estado y calificación', async () => {
    const req = { query: { estado: 'activo', calificacion: 'alta' } };
    const res = buildRes();

    obtenerClientesService.mockResolvedValue({
      clientes: mockClientes,
      total: totalClientes,
    });

    await obtenerClientesController(req, res);

    expect(obtenerClientesService).toHaveBeenCalledWith({
      filtros: { estado: 'activo', calificacion: 'alta' },
      opciones: {
        page: undefined,
        limit: undefined,
        sortBy: undefined,
        order: undefined,
      },
    });

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('🔍 responde con paginación y ordenamiento', async () => {
    const req = {
      query: {
        page: '2',
        limit: '10',
        sortBy: 'nombre',
        order: 'desc',
      },
    };
    const res = buildRes();

    obtenerClientesService.mockResolvedValue({
      clientes: mockClientes,
      total: totalClientes,
    });

    await obtenerClientesController(req, res);

    expect(obtenerClientesService).toHaveBeenCalledWith({
      filtros: {},
      opciones: {
        page: '2',
        limit: '10',
        sortBy: 'nombre',
        order: 'desc',
      },
    });

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('❌ responde con error si falla el servicio', async () => {
    const req = { query: {} };
    const res = buildRes();

    obtenerClientesService.mockRejectedValue({
      status: 500,
      mensaje: 'Error al obtener clientes',
    });

    await obtenerClientesController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      ok: false,
      message: 'Error al obtener clientes',
      mensaje: 'Error al obtener clientes',
    });
  });
});
