jest.mock('../../../../services/clientes/obtenerClientesService');

const obtenerClientePorIdController = require('../../../../controllers/clientes/obtenerClientePorIdController');
const obtenerClientesService = require('../../../../services/clientes/obtenerClientesService');

const buildRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
});

describe('obtenerClientePorIdController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('✅ responde con cliente encontrado', async () => {
    const mockCliente = { _id: '123', nombre: 'Juan' };

    obtenerClientesService.mockResolvedValue(mockCliente);

    const req = { params: { id: '123' } };
    const res = buildRes();

    await obtenerClientePorIdController(req, res);

    expect(obtenerClientesService).toHaveBeenCalledWith({ id: '123' });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      ok: true,
      message: 'Cliente encontrado',
      mensaje: 'Cliente encontrado',
      details: {
        cliente: mockCliente,
      },
    });
  });

  it('❌ responde con error si ID es inválido', async () => {
    obtenerClientesService.mockRejectedValue({
      status: 400,
      mensaje: 'ID inválido',
    });

    const req = { params: { id: 'id_invalido' } };
    const res = buildRes();

    await obtenerClientePorIdController(req, res);

    expect(obtenerClientesService).toHaveBeenCalledWith({ id: 'id_invalido' });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      ok: false,
      message: 'ID inválido',
      mensaje: 'ID inválido',
    });
  });

  it('❌ responde con error si cliente no existe', async () => {
    obtenerClientesService.mockRejectedValue({
      status: 404,
      mensaje: 'Cliente no encontrado',
    });

    const req = { params: { id: '666f123456789abcde000000' } };
    const res = buildRes();

    await obtenerClientePorIdController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      ok: false,
      message: 'Cliente no encontrado',
      mensaje: 'Cliente no encontrado',
    });
  });

  it('❌ responde con error 500 si ocurre un error inesperado', async () => {
    obtenerClientesService.mockRejectedValue(new Error('Fallo inesperado'));

    const req = { params: { id: '123' } };
    const res = buildRes();

    await obtenerClientePorIdController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      ok: false,
      message: 'Error al obtener cliente',
      mensaje: 'Error al obtener cliente',
    });
  });
});
