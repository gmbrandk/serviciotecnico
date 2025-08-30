const inicializarHistorialClientes = require('../../helpers/equipos/inicializarHistorialClientes');

describe('inicializarHistorialClientes', () => {
  it('debería devolver un array vacío si no se pasa clienteId', () => {
    expect(inicializarHistorialClientes()).toEqual([]);
    expect(inicializarHistorialClientes(null)).toEqual([]);
    expect(inicializarHistorialClientes(undefined)).toEqual([]);
  });

  it('debería devolver un array con un objeto si se pasa clienteId', () => {
    const clienteId = '12345';
    const historial = inicializarHistorialClientes(clienteId);

    expect(Array.isArray(historial)).toBe(true);
    expect(historial).toHaveLength(1);

    const item = historial[0];
    expect(item.clienteId).toBe(clienteId);
    expect(item.fechaAsignacion).toBeInstanceOf(Date);
  });

  it('debería usar la fecha actual controlada con fake timers', () => {
    jest.useFakeTimers().setSystemTime(new Date('2025-01-01T00:00:00Z'));

    const historial = inicializarHistorialClientes('abc');
    expect(historial[0].fechaAsignacion).toEqual(
      new Date('2025-01-01T00:00:00Z')
    );

    jest.useRealTimers();
  });
});
