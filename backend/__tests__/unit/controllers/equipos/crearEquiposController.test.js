// 📁 __tests__/controllers/equipos/crearEquipoController.test.js

const crearEquipoController = require('@controllers/equipos/crearEquipoController');
const crearEquipoService = require('@services/equipos/crearEquipoService');

jest.mock('@services/equipos/crearEquipoService');

describe('crearEquipoController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        tipo: 'laptop',
        modelo: 'Asus X515EA',
        clienteActual: 'clienteId123',
        sku: 'SKU-001',
      },
    };

    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
  });

  it('debe responder 201 cuando el equipo se crea correctamente', async () => {
    const mockEquipo = { _id: '123', ...req.body };
    crearEquipoService.mockResolvedValue(mockEquipo);

    await crearEquipoController(req, res);

    expect(crearEquipoService).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      mensaje: 'Equipo creado correctamente',
      equipo: mockEquipo,
    });
  });

  it('debe responder 400 cuando el servicio lanza un error', async () => {
    crearEquipoService.mockRejectedValue(new Error('Error de validación'));

    await crearEquipoController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      mensaje: 'Error de validación',
    });
  });
});
