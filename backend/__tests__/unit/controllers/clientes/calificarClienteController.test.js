// __tests__/unit/controllers/clientes/calificarClienteController.test.js

const calificarClienteController = require('@controllers/clientes/calificarController');
const calificarClienteService = require('@services/clientes/calificarClienteService');

jest.mock('@services/clientes/calificarClienteService');

describe('🧪 calificarClienteController - Unit Test', () => {
  let req, res;

  beforeEach(() => {
    req = { params: { id: 'cliente123' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('✅ Responde con 200 y datos del cliente si todo va bien', async () => {
    const clienteMock = { _id: 'cliente123', calificacion: 'bueno' };

    calificarClienteService.mockResolvedValue({
      cliente: clienteMock,
      mensaje: 'Calificación actualizada correctamente',
    });

    await calificarClienteController(req, res);

    expect(calificarClienteService).toHaveBeenCalledWith('cliente123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      mensaje: 'Calificación actualizada correctamente',
      cliente: clienteMock,
    });
  });

  it('🚫 Devuelve 404 si el cliente no existe', async () => {
    calificarClienteService.mockRejectedValue(
      new Error('Cliente no encontrado')
    );

    await calificarClienteController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      mensaje: 'Cliente no encontrado',
    });
  });

  it('🔥 Devuelve 500 si ocurre un error inesperado', async () => {
    calificarClienteService.mockRejectedValue(
      new Error('Fallo en base de datos')
    );

    await calificarClienteController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      mensaje: 'Fallo en base de datos',
    });
  });
});
