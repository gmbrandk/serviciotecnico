// __tests__/unit/calcularCalificacionBase.test.js
const {
  calcularCalificacionBase,
} = require('@services/clientes/calcularCalificacionCliente');

describe('🧪 calcularCalificacionBase', () => {
  it('🔹 muy_bueno: 5 reparadas, 0 malas (100%)', () => {
    const ordenes = Array(5).fill({ estadoEquipo: 'reparado' });
    const resultado = calcularCalificacionBase(ordenes);
    expect(resultado).toBe('muy_bueno');
  });

  it('🔹 bueno: 3 reparadas, 1 retiro_cliente (75%)', () => {
    const ordenes = [
      { estadoEquipo: 'reparado' },
      { estadoEquipo: 'reparado' },
      { estadoEquipo: 'reparado' },
      { estadoEquipo: 'retiro_cliente' },
    ];
    const resultado = calcularCalificacionBase(ordenes);
    expect(resultado).toBe('bueno');
  });

  it('🔹 regular: 2 reparadas, 2 retiro_cliente (50%)', () => {
    const ordenes = [
      { estadoEquipo: 'reparado' },
      { estadoEquipo: 'reparado' },
      { estadoEquipo: 'retiro_cliente' },
      { estadoEquipo: 'retiro_cliente' },
    ];
    const resultado = calcularCalificacionBase(ordenes);
    expect(resultado).toBe('regular');
  });

  it('🔹 malo: 1 reparada, 2 retiro_cliente (33%)', () => {
    const ordenes = [
      { estadoEquipo: 'reparado' },
      { estadoEquipo: 'retiro_cliente' },
      { estadoEquipo: 'retiro_cliente' },
    ];
    const resultado = calcularCalificacionBase(ordenes);
    expect(resultado).toBe('malo');
  });

  it('🔹 muy_malo: 1 reparada, 4 retiro_cliente (20%)', () => {
    const ordenes = [
      { estadoEquipo: 'reparado' },
      { estadoEquipo: 'retiro_cliente' },
      { estadoEquipo: 'retiro_cliente' },
      { estadoEquipo: 'retiro_cliente' },
      { estadoEquipo: 'retiro_cliente' },
    ];
    const resultado = calcularCalificacionBase(ordenes);
    expect(resultado).toBe('muy_malo');
  });

  it('🔸 ignora irreparable: 2 reparadas + 3 irreparables = 100% sobre 2 válidas', () => {
    const ordenes = [
      { estadoEquipo: 'reparado' },
      { estadoEquipo: 'reparado' },
      { estadoEquipo: 'irreparable' },
      { estadoEquipo: 'irreparable' },
      { estadoEquipo: 'irreparable' },
    ];
    const resultado = calcularCalificacionBase(ordenes);
    expect(resultado).toBe('bueno'); // 100% pero total < 5
  });

  it('🔸 sin órdenes válidas: solo irreparables', () => {
    const ordenes = [
      { estadoEquipo: 'irreparable' },
      { estadoEquipo: 'irreparable' },
    ];
    const resultado = calcularCalificacionBase(ordenes);
    expect(resultado).toBe('regular'); // No hay suficientes datos
  });
});
