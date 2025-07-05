const mongoose = require('mongoose');
const crearEquipoService = require('@services/equipos/crearEquipoService');
const Equipo = require('@models/Equipo');
const FichaTecnica = require('@models/FichaTecnica');
const calcularEspecificacionesEquipo = require('@helpers/equipos/calcularEspecificacionesEquipo');
const vincularFichaTecnica = require('@helpers/equipos/vincularFichaTecnica');

jest.mock('@models/Equipo');
jest.mock('@models/FichaTecnica');
jest.mock('@helpers/equipos/calcularEspecificacionesEquipo');
jest.mock('@helpers/equipos/vincularFichaTecnica');

describe('🧪 crearEquipoService (unit)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const baseData = {
    tipo: 'laptop',
    marca: 'hp',
    modelo: 'elitebook 840',
    sku: 'sku-001',
    nroSerie: 'abc123',
    clienteActual: new mongoose.Types.ObjectId().toString(),
    fichaTecnicaManual: {
      cpu: 'Intel i5',
      ram: '8GB',
      almacenamiento: '256GB SSD',
      gpu: 'Intel UHD',
    },
  };

  it('✅ debería crear el equipo correctamente con ficha técnica manual', async () => {
    Equipo.findOne.mockResolvedValue(null); // No hay duplicados
    vincularFichaTecnica.mockResolvedValue(null); // No hay plantilla
    FichaTecnica.create.mockResolvedValue({ _id: 'mockFichaId' });

    calcularEspecificacionesEquipo.mockReturnValue({
      especificacionesActuales: {
        cpu: { valor: 'Intel i5', fuente: 'manual' },
        ram: { valor: '8GB', fuente: 'manual' },
        almacenamiento: { valor: '256GB SSD', fuente: 'manual' },
        gpu: { valor: 'Intel UHD', fuente: 'manual' },
      },
      repotenciado: false,
    });

    const equipoGuardado = {
      save: jest.fn().mockResolvedValue(true),
      _id: 'mockEquipoId',
    };
    Equipo.mockImplementation(() => equipoGuardado);

    const res = await crearEquipoService(baseData);

    expect(Equipo.findOne).toHaveBeenCalledWith({ nroSerie: 'ABC123' });
    expect(FichaTecnica.create).toHaveBeenCalled();
    expect(equipoGuardado.save).toHaveBeenCalled();
    expect(res._id).toBe('mockEquipoId');
  });

  it('🚫 debería lanzar error si falta clienteActual', async () => {
    await expect(
      crearEquipoService({ ...baseData, clienteActual: undefined })
    ).rejects.toThrow('El campo "clienteActual" es obligatorio');
  });

  it('🚫 debería lanzar error si el nroSerie ya existe', async () => {
    Equipo.findOne.mockResolvedValue({ _id: 'duplicado' });

    await expect(crearEquipoService(baseData)).rejects.toThrow(
      /número de serie/i
    );
  });

  it('♻️ debería reusar ficha técnica existente si ya está en BD', async () => {
    Equipo.findOne.mockResolvedValue(null);
    vincularFichaTecnica.mockResolvedValue({ _id: 'fichaExistenteId' });

    calcularEspecificacionesEquipo.mockReturnValue({
      especificacionesActuales: {},
      repotenciado: false,
    });

    const equipoMock = { save: jest.fn().mockResolvedValue(true) };
    Equipo.mockImplementation(() => equipoMock);

    await crearEquipoService(baseData);

    expect(vincularFichaTecnica).toHaveBeenCalled();
    expect(FichaTecnica.create).not.toHaveBeenCalled();
  });
});
