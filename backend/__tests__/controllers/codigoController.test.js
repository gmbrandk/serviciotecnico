
const { generarCodigoAcceso } = require('@controllers/codigoController');
const CodigoAcceso = require('@models/CodigoAcceso');
const crypto = require('crypto');

jest.mock('@models/CodigoAcceso');
jest.mock('crypto');

describe('generarCodigoAcceso', () => {
  let req, res;

  beforeEach(() => {
    req = {
      usuario: { role: 'superAdministrador', id: 'user123' },
      body: { usos: 3 },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    crypto.randomBytes.mockReturnValue(Buffer.from('12345678', 'hex'));
    CodigoAcceso.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(true),
    }));
  });

  it('debería crear un código si el usuario tiene rol válido', async () => {
    await generarCodigoAcceso(req, res);

    expect(crypto.randomBytes).toHaveBeenCalledWith(4);
    expect(CodigoAcceso).toHaveBeenCalledWith({
      codigo: '12345678'.toUpperCase(),
      usosDisponibles: 3,
      creadoPor: 'user123',
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      codigo: '12345678'.toUpperCase(),
    });
  });

  it('debería rechazar si el usuario no tiene permiso', async () => {
    req.usuario.role = 'tecnico';

    await generarCodigoAcceso(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Acceso denegado' });
  });
});
