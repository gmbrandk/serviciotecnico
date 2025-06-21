const crearEquipoService = require('@services/equipos/crearEquipoService');
const FichaTecnica = require('@models/FichaTecnica');

// ✅ Equipo mock corregido
jest.mock('@models/Equipo', () => {
  const saveMock = jest.fn().mockResolvedValue(true);
  const MockEquipo = function (data) {
    return { ...data, save: saveMock };
  };
  MockEquipo.findOne = jest.fn();
  MockEquipo.__saveMock = saveMock;
  return MockEquipo;
});

jest.mock('@models/FichaTecnica');
jest.mock('@helpers/equipos/vincularFichaTecnica', () => jest.fn());
jest.mock('@helpers/equipos/inicializarHistorialClientes', () =>
  jest.fn(() => [{ clienteId: 'cliente123', fechaAsignacion: new Date() }])
);

const vincularFichaTecnica = require('@helpers/equipos/vincularFichaTecnica');
const Equipo = require('@models/Equipo');

describe('crearEquipoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('✅ Usa ficha técnica existente e ignora fichaTecnicaManual', async () => {
    const fichaExistente = { _id: 'id123', modelo: 'Asus X515EA' };
    vincularFichaTecnica.mockResolvedValue(fichaExistente);

    const data = {
      tipo: 'laptop',
      modelo: 'Asus X515EA',
      clienteActual: 'clienteId123',
      fichaTecnicaManual: {
        modelo: 'manual',
        cpu: 'i5',
      },
    };

    const equipo = await crearEquipoService(data);

    expect(FichaTecnica.create).not.toHaveBeenCalled();
    expect(equipo.fichaTecnica).toBe(fichaExistente._id); // ✅
  });

  it('✅ Crea ficha técnica manual si no existe ninguna', async () => {
    vincularFichaTecnica.mockResolvedValue(null);

    const fichaCreada = { _id: 'fichaManualId' };
    FichaTecnica.create.mockResolvedValue(fichaCreada);

    const equipo = await crearEquipoService({
      tipo: 'laptop',
      modelo: 'HP Envy',
      sku: '123-HP',
      clienteActual: 'cliente123',
      fichaTecnicaManual: {
        cpu: 'AMD Ryzen 5',
        ram: '16GB',
      },
    });

    expect(FichaTecnica.create).toHaveBeenCalledWith(
      expect.objectContaining({
        cpu: 'AMD Ryzen 5',
        ram: '16GB',
        modelo: 'HP Envy',
        sku: '123-HP',
        fuente: 'manual',
      })
    );
    expect(equipo.fichaTecnica).toBe(fichaCreada._id);
  });

  it('❌ No crea ficha técnica si no hay existente ni fichaTecnicaManual', async () => {
    vincularFichaTecnica.mockResolvedValue(null);

    const equipo = await crearEquipoService({
      tipo: 'impresora',
      modelo: 'Epson L3150',
      clienteActual: 'cliente123',
    });

    expect(FichaTecnica.create).not.toHaveBeenCalled();
    expect(equipo.fichaTecnica).toBe(null);
  });

  it('❌ Lanza error si ya existe un equipo con el mismo número de serie', async () => {
    Equipo.findOne.mockResolvedValue({ _id: 'duplicado123' });

    await expect(
      crearEquipoService({
        tipo: 'laptop',
        modelo: 'Dell XPS',
        clienteActual: 'clienteX',
        nroSerie: 'SN1234',
      })
    ).rejects.toThrow('Ya existe un equipo con ese número de serie');
  });

  it('❌ Lanza error si falta tipo, modelo o clienteActual', async () => {
    await expect(
      crearEquipoService({
        modelo: 'SinTipo',
        clienteActual: 'cliente123',
      })
    ).rejects.toThrow(
      'Los campos tipo, modelo y clienteActual son obligatorios'
    );
  });

  it('✅ Crea equipo con ficha técnica existente + campos sobrescritos (repotenciado)', async () => {
    // 🔧 Ficha técnica base con todos los campos definidos
    const fichaBase = {
      _id: 'ficha123',
      ram: '8GB',
      almacenamiento: '256GB SSD',
      cpu: 'Intel i5',
      gpu: 'Intel UHD',
    };

    vincularFichaTecnica.mockResolvedValue(fichaBase);
    FichaTecnica.create.mockResolvedValue(null); // No debe llamarse

    const equipo = await crearEquipoService({
      tipo: 'laptop',
      modelo: 'Asus VivoBook',
      sku: 'ASUS-XYZ',
      clienteActual: 'cliente123',
      fichaTecnicaManual: {
        ram: '16GB', // sobrescrito
        almacenamiento: '256GB SSD', // igual al template
        cpu: 'Intel i7', // sobrescrito
        gpu: 'Intel UHD', // igual al template
      },
    });

    // ✅ Verificamos que use la ficha técnica existente
    expect(equipo.fichaTecnica).toBe(fichaBase._id);

    // ✅ Verificamos las especificaciones actuales con fuentes correctas
    expect(equipo.especificacionesActuales).toEqual({
      ram: { valor: '16GB', fuente: 'manual' },
      almacenamiento: { valor: '256GB SSD', fuente: 'template' },
      cpu: { valor: 'Intel i7', fuente: 'manual' },
      gpu: { valor: 'Intel UHD', fuente: 'template' },
    });
  });

  it('✅ Valida que la fuente se setee correctamente para cada campo', async () => {
    const fichaBase = {
      _id: 'fichaABC',
      ram: '8GB',
      almacenamiento: '256GB SSD',
      cpu: 'Intel i5',
      gpu: 'Intel UHD',
    };
    vincularFichaTecnica.mockResolvedValue(fichaBase);
    FichaTecnica.create.mockResolvedValue(null);

    const equipo = await crearEquipoService({
      tipo: 'laptop',
      modelo: 'HP Envy',
      sku: 'HP-ENVY-456',
      clienteActual: 'cliente456',
      fichaTecnicaManual: {
        ram: '16GB', // sobrescrito → manual
        cpu: 'Intel i5', // igual → template
        gpu: 'Intel UHD', // igual → template
        almacenamiento: '512GB SSD', // sobrescrito → manual
      },
    });

    expect(equipo.fichaTecnica).toBe(fichaBase._id);
    expect(equipo.especificacionesActuales).toEqual({
      ram: { valor: '16GB', fuente: 'manual' },
      almacenamiento: { valor: '512GB SSD', fuente: 'manual' },
      cpu: { valor: 'Intel i5', fuente: 'template' },
      gpu: { valor: 'Intel UHD', fuente: 'template' },
    });
  });

  it('✅ Crea equipo aunque no haya ficha técnica ni fichaTecnicaManual', async () => {
    // No se encuentra ficha técnica
    vincularFichaTecnica.mockResolvedValue(null);
    // No se intenta crear ninguna ficha técnica
    FichaTecnica.create.mockResolvedValue(null);

    const equipo = await crearEquipoService({
      tipo: 'laptop',
      modelo: 'Desconocido',
      sku: 'UNK-000',
      clienteActual: 'cliente123',
    });

    expect(FichaTecnica.create).not.toHaveBeenCalled();
    expect(equipo.fichaTecnica).toBe(null);
    expect(equipo.especificacionesActuales).toEqual({}); // ← campos vacíos permitidos
  });
});
