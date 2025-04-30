// tests/controllers/codigoController.test.js
const { generarCodigoAcceso } = require('../../controllers/codigoController');
const CodigoAcceso = require('../../models/CodigoAcceso');
const crypto = require('crypto');
const { logError } = require('../../utils/logger');

jest.mock('../../models/CodigoAcceso');
jest.mock('../../utils/logger');

describe('generarCodigoAcceso', () => {
  let req, res;

  beforeEach(() => {
    req = {
      usuario: { id: 'user123', role: 'superadministrador' },
      body: { usos: 2 }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.spyOn(crypto, 'randomBytes').mockReturnValue(Buffer.from('abcd1234'));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('debería crear un código si el usuario tiene rol válido', async () => {
    const fechaMock = new Date('2025-04-29T00:00:00Z');
    const mockSave = jest.fn();
    CodigoAcceso.mockImplementation(() => ({
      save: mockSave,
      _id: 'mockId',
      codigo: 'ABCD1234',
      estado: 'activo',
      usosDisponibles: 2,
      fechaCreacion: fechaMock
    }));

    await generarCodigoAcceso(req, res);

    expect(mockSave).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      codigo: {
        id: 'mockId',
        codigo: 'ABCD1234',
        estado: 'activo',
        usosDisponibles: 2,
        fechaCreacion: fechaMock
      }
    });
  });

  it('debería rechazar si el usuario no tiene permiso', async () => {
    req.usuario.role = 'tecnico';

    await generarCodigoAcceso(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Acceso denegado' });
  });

  it('debería rechazar si el número de usos no está entre 1 y 5', async () => {
    req.body.usos = 10;

    await generarCodigoAcceso(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'El número de usos debe estar entre 1 y 5' });
  });

  it('debería responder con 500 si ocurre un error al guardar el código', async () => {
    CodigoAcceso.mockImplementation(() => ({
      save: jest.fn().mockRejectedValue(new Error('DB error'))
    }));

    await generarCodigoAcceso(req, res);

    expect(logError).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Error al generar código' });
  });

  it('debería usar 1 uso por defecto si no se envía usos en el body', async () => {
    req.body = {}; // sin usos
    const mockSave = jest.fn();
    CodigoAcceso.mockImplementation(() => ({
      save: mockSave,
      _id: 'mockId',
      codigo: 'ABCD1234',
      estado: 'activo',
      usosDisponibles: 1,
      fechaCreacion: new Date()
    }));

    await generarCodigoAcceso(req, res);

    expect(mockSave).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      codigo: expect.objectContaining({ usosDisponibles: 1 })
    }));
  });

  it('debería crear un código con estado y fecha de creación si el usuario tiene rol válido', async () => {
    const fechaMock = new Date();
    CodigoAcceso.mockImplementation(() => ({
      save: jest.fn(),
      _id: 'mockId',
      codigo: 'ABCD1234',
      estado: 'activo',
      usosDisponibles: 2,
      fechaCreacion: fechaMock
    }));

    await generarCodigoAcceso(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      codigo: expect.objectContaining({
        estado: 'activo',
        fechaCreacion: fechaMock
      })
    }));
  });

  it('debería establecer estado como "activo" por defecto', async () => {
    CodigoAcceso.mockImplementation(() => ({
      save: jest.fn(),
      _id: 'mockId',
      codigo: 'ABCD1234',
      estado: 'activo',
      usosDisponibles: 2,
      fechaCreacion: new Date()
    }));

    await generarCodigoAcceso(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      codigo: expect.objectContaining({ estado: 'activo' })
    }));
  });
});
