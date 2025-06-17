// 📁 __tests__/unit/services/crearEquipoService.test.js

const crearEquipoService = require('@services/equipos/crearEquipoService');
const Equipo = require('@models/Equipo');
const vincularFichaTecnica = require('@helpers/equipos/vincularFichaTecnica');
const inicializarHistorialClientes = require('@helpers/equipos/inicializarHistorialClientes');

// Mockeamos los helpers y modelo
jest.mock('@models/Equipo');
jest.mock('@helpers/equipos/vincularFichaTecnica');
jest.mock('@helpers/equipos/inicializarHistorialClientes');

describe('crearEquipoService', () => {
  const baseData = {
    tipo: 'laptop',
    marca: 'ASUS',
    modelo: 'Vivobook X515EA',
    sku: 'X515EA-BQ1370T',
    nroSerie: 'SN123456789',
    clienteActual: 'clienteId123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe crear un equipo correctamente con ficha técnica y historial', async () => {
    const fichaMock = { _id: 'fichaId123' };
    const historialMock = [
      { clienteId: 'clienteId123', fechaAsignacion: new Date() },
    ];
    const equipoGuardado = { ...baseData, save: jest.fn() };

    vincularFichaTecnica.mockResolvedValue(fichaMock);
    inicializarHistorialClientes.mockReturnValue(historialMock);
    Equipo.mockImplementation(() => equipoGuardado);

    const result = await crearEquipoService(baseData);

    expect(vincularFichaTecnica).toHaveBeenCalledWith({
      modelo: baseData.modelo,
      sku: baseData.sku,
    });

    expect(inicializarHistorialClientes).toHaveBeenCalledWith(
      baseData.clienteActual
    );
    expect(equipoGuardado.save).toHaveBeenCalled();
    expect(result).toBe(equipoGuardado);
  });

  it('debe lanzar error si falta tipo, modelo o clienteActual', async () => {
    await expect(crearEquipoService({})).rejects.toThrow(
      'Los campos tipo, modelo y clienteActual son obligatorios'
    );
  });

  it('debe lanzar error si el nroSerie ya existe', async () => {
    Equipo.findOne.mockResolvedValue({ _id: 'yaExisteId' });

    await expect(
      crearEquipoService({ ...baseData, nroSerie: 'SN123456789' })
    ).rejects.toThrow('Ya existe un equipo con ese número de serie');
  });
});
