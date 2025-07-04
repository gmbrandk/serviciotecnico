// 📁 __tests__/controllers/equipos/crearEquipoController.test.js

const httpMocks = require('node-mocks-http');
const crearEquipoController = require('@controllers/equipos/crearEquipoController');
const crearEquipoService = require('@services/equipos/crearEquipoService');
const { ValidationError } = require('@utils/errors');

jest.mock('@services/equipos/crearEquipoService');

describe('🧪 crearEquipoController', () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest({
      method: 'POST',
      url: '/api/equipos',
      body: {
        tipo: 'laptop',
        marca: 'HP',
        modelo: 'EliteBook 840',
        sku: 'HP-840-001',
        nroSerie: 'ABC123XYZ',
        clienteActual: '64ff1d2a2a4c9d2f04b5b012',
        fichaTecnicaManual: {
          cpu: 'Intel i5',
          ram: '8GB',
          almacenamiento: '256GB SSD',
          gpu: 'Intel UHD',
        },
      },
    });
    res = httpMocks.createResponse();
  });

  it('✅ debería crear el equipo y responder con status 201', async () => {
    const equipoMock = {
      _id: 'abc123',
      ...req.body,
      historialPropietarios: [
        {
          clienteId: req.body.clienteActual,
          fechaAsignacion: new Date(),
        },
      ],
      especificacionesActuales: {
        cpu: { valor: 'Intel i5', fuente: 'manual' },
        ram: { valor: '8GB', fuente: 'manual' },
        almacenamiento: { valor: '256GB SSD', fuente: 'manual' },
        gpu: { valor: 'Intel UHD', fuente: 'manual' },
      },
      repotenciado: false,
    };

    crearEquipoService.mockResolvedValue(equipoMock);

    await crearEquipoController(req, res);
    res._getData();
    const data = res._getJSONData();

    expect(res.statusCode).toBe(201);
    expect(data.success).toBe(true);
    expect(data.mensaje).toBe('Equipo creado correctamente');
    expect(data.equipo).toMatchObject(equipoMock);
  });

  it('❌ debería capturar errores de validación del servicio', async () => {
    const error = new ValidationError('clienteActual es requerido');
    crearEquipoService.mockRejectedValue(error);

    await crearEquipoController(req, res);
    res._getData();
    const data = res._getJSONData();

    expect(res.statusCode).toBe(400);
    expect(data.success).toBe(false);
    expect(data.mensaje).toBe('clienteActual es requerido');
  });

  it('🔥 debería capturar errores inesperados con status 500 por defecto', async () => {
    const error = new Error('Falla inesperada');
    crearEquipoService.mockRejectedValue(error);

    await crearEquipoController(req, res);
    res._getData();
    const data = res._getJSONData();

    expect(res.statusCode).toBe(500);
    expect(data.success).toBe(false);
    expect(data.mensaje).toBe('Falla inesperada');
  });
});
