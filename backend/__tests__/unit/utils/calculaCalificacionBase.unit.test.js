// __tests__/unit/calcularCalificacionBase.test.js
const {
  calcularCalificacionBase,
} = require('@services/clientes/calcularCalificacionCliente');

describe('🧠 calcularCalificacionBase', () => {
  it('✅ retorna regular si no hay órdenes relevantes', () => {
    expect(calcularCalificacionBase([])).toBe('regular');
  });

  it('✅ retorna regular si solo hay una negativa', () => {
    const ordenes = [{ estadoEquipo: 'retiro_cliente' }];
    expect(calcularCalificacionBase(ordenes)).toBe('regular');
  });

  it('✅ retorna regular si hay 2 malas', () => {
    const ordenes = [
      { estadoEquipo: 'retiro_cliente' },
      { estadoEquipo: 'retiro_cliente' },
    ];
    expect(calcularCalificacionBase(ordenes)).toBe('regular');
  });

  it('✅ retorna bueno con 3 de 4 buenas', () => {
    const ordenes = [
      { estadoEquipo: 'reparado' },
      { estadoEquipo: 'reparado' },
      { estadoEquipo: 'reparado' },
      { estadoEquipo: 'retiro_cliente' },
    ];
    expect(calcularCalificacionBase(ordenes)).toBe('bueno');
  });

  it('✅ retorna muy_bueno si 9 de 10 son buenas', () => {
    const ordenes = [
      ...Array(9).fill({ estadoEquipo: 'reparado' }),
      { estadoEquipo: 'retiro_cliente' },
    ];
    expect(calcularCalificacionBase(ordenes)).toBe('muy_bueno');
  });

  it('✅ retorna muy_malo si 5 de 5 son malas', () => {
    const ordenes = Array(5).fill({ estadoEquipo: 'retiro_cliente' });
    expect(calcularCalificacionBase(ordenes)).toBe('muy_malo');
  });

  it('✅ ignora órdenes irreparables', () => {
    const ordenes = [
      { estadoEquipo: 'irreparable' },
      { estadoEquipo: 'irreparable' },
      { estadoEquipo: 'irreparable' },
    ];
    expect(calcularCalificacionBase(ordenes)).toBe('regular');
  });

  it('✅ retorna malo si 2 de 5 son buenas (40%)', () => {
    const ordenes = [
      ...Array(2).fill({ estadoEquipo: 'reparado' }),
      ...Array(3).fill({ estadoEquipo: 'retiro_cliente' }),
    ];
    expect(calcularCalificacionBase(ordenes)).toBe('malo');
  });

  it('✅ retorna regular si no califica para ningún otro caso', () => {
    const ordenes = [
      { estadoEquipo: 'reparado' },
      { estadoEquipo: 'retiro_cliente' },
      { estadoEquipo: 'irreparable' },
    ];
    expect(calcularCalificacionBase(ordenes)).toBe('regular');
  });
});
