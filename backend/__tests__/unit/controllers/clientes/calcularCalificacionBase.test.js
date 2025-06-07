// __tests__/services/calcularCalificacionBase.test.js

const {
  calcularCalificacionBase,
} = require('@services/clientes/calcularCalificacionCliente');

describe('🧠 calcularCalificacionBase - Función pura', () => {
  it('✅ Muy bueno: 90% o más de órdenes buenas con al menos 5 órdenes', () => {
    const ordenes = Array(9)
      .fill({ estadoFinal: 'reparado' })
      .concat({ estadoFinal: 'no_reparado' });
    expect(calcularCalificacionBase(ordenes)).toBe('muy_bueno');
  });

  it('👍 Bueno: entre 70% y 89% de órdenes buenas', () => {
    const ordenes = [
      ...Array(7).fill({ estadoFinal: 'reparado' }),
      ...Array(3).fill({ estadoFinal: 'no_reparado' }),
    ];
    expect(calcularCalificacionBase(ordenes)).toBe('bueno');
  });

  it('🟡 Regular: entre 50% y 69%', () => {
    const ordenes = [
      ...Array(5).fill({ estadoFinal: 'reparado' }),
      ...Array(5).fill({ estadoFinal: 'no_reparado' }),
    ];
    expect(calcularCalificacionBase(ordenes)).toBe('regular');
  });

  it('⚠️ Malo: entre 30% y 49%', () => {
    const ordenes = [
      ...Array(3).fill({ estadoFinal: 'reparado' }),
      ...Array(7).fill({ estadoFinal: 'no_reparado' }),
    ];
    expect(calcularCalificacionBase(ordenes)).toBe('malo');
  });

  it('🚫 Muy malo: menos de 30%', () => {
    const ordenes = [
      { estadoFinal: 'reparado' },
      ...Array(9).fill({ estadoFinal: 'no_reparado' }),
    ];
    expect(calcularCalificacionBase(ordenes)).toBe('muy_malo');
  });

  it('📭 Sin órdenes: retorna "regular" por defecto', () => {
    expect(calcularCalificacionBase([])).toBe('regular');
  });

  it('📦 Cuenta retiroSinReparar como malo', () => {
    const ordenes = [{ estadoFinal: 'reparado' }, { retiroSinReparar: true }];
    expect(calcularCalificacionBase(ordenes)).toBe('regular');
  });
});
