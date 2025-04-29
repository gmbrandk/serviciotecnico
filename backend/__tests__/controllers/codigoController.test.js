
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
      estado: 'activo',
      fechaCreacion: expect.any(Date), // Usamos expect.any para validar que es un objeto Date
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      codigo: '12345678'.toUpperCase(),
        estado: 'activo',
        fechaCreacion: expect.any(Date), // Verificamos que la fecha de creación sea un objeto Date
        usosDisponibles: 3,
        id: 'user123',
      codigo: {
        codigo: '12345678'.toUpperCase(),
        estado: 'activo',
        fechaCreacion: expect.any(Date), // Verificamos que la fecha de creación sea un objeto Date
        usosDisponibles: 3,
        id: 'user123',
      },
    });
  });

  it('debería rechazar si el usuario no tiene permiso', async () => {
    req.usuario.role = 'tecnico';

    await generarCodigoAcceso(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Acceso denegado' });
  });

  it('debería rechazar si el número de usos no está entre 1 y 5', async () => {
    req.body.usos = 10; // valor fuera de rango
  
    await generarCodigoAcceso(req, res);
  
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'El número de usos debe estar entre 1 y 5' });
  });
  
  it('debería responder con 500 si ocurre un error al guardar el código', async () => {
    CodigoAcceso.mockImplementation(() => ({
      save: jest.fn().mockRejectedValue(new Error('Fallo en la BD')),
    }));
  
    await generarCodigoAcceso(req, res);
  
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Error al generar código' });
  });
  
  it('debería usar 1 uso por defecto si no se envía usos en el body', async () => {
    req.body = {}; // Sin usos
  
    await generarCodigoAcceso(req, res);
  
    expect(CodigoAcceso).toHaveBeenCalledWith(expect.objectContaining({
      usosDisponibles: 1,
    }));
  });

  it('debería responder con 500 si ocurre un error al guardar el código', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); // silencia
  
    CodigoAcceso.mockImplementation(() => ({
      save: jest.fn().mockRejectedValue(new Error('Fallo en la BD')),
    }));
  
    await generarCodigoAcceso(req, res);
  
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Error al generar código' });
  
    consoleErrorSpy.mockRestore(); // vuelve a la normalidad después
  });
  
  it('debería crear un código con estado y fecha de creación si el usuario tiene rol válido', async () => {
    await generarCodigoAcceso(req, res);
  
    expect(crypto.randomBytes).toHaveBeenCalledWith(4);
  
    expect(CodigoAcceso).toHaveBeenCalledWith(expect.objectContaining({
      codigo: '12345678'.toUpperCase(),
      usosDisponibles: 3,
      creadoPor: 'user123',
      estado: 'activo',
      fechaCreacion: expect.any(Date) // ✅ verifica que sea una fecha
    }));
  
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      codigo: expect.any(Object), // ya que ahora envías un objeto con id, codigo, etc.
    }));
  });

  it('debería establecer estado como "activo" por defecto', async () => {
    await generarCodigoAcceso(req, res);
  
    expect(CodigoAcceso).toHaveBeenCalledWith(expect.objectContaining({
      estado: 'activo'
    }));
  });  
});
