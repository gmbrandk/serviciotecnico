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
});
