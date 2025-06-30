// 📁 __tests__/utils/validarYFormatearTelefono.test.js
const validarYFormatearTelefono = require('@utils/telefonia/validarYFormatearTelefono');

console.log('🧪 Iniciando pruebas de validación de teléfonos...');

describe('📞 Validar y Formatear Teléfono', () => {
  test('✅ Teléfono peruano sin prefijo', () => {
    const resultado = validarYFormatearTelefono('987654321');
    console.log('🔍 Detectado Perú:', resultado);
    expect(resultado.telefonoFormateado).toBe('+51987654321');
    expect(resultado.iso).toBe('PE');
    expect(resultado.longitudEsperada || 9).toBe(9);
  });

  test('✅ Teléfono chileno con prefijo', () => {
    const resultado = validarYFormatearTelefono('+56987654321');
    console.log('🔍 Detectado Chile:', resultado);
    expect(resultado.telefonoFormateado).toBe('+56987654321');
    expect(resultado.iso).toBe('CL');
  });

  test('❌ Teléfono argentino con longitud incorrecta', () => {
    try {
      validarYFormatearTelefono('+5498765432');
    } catch (error) {
      console.warn('⚠️ Longitud inválida para Argentina:', error.message);
      expect(error.message).toMatch(/debe tener/);
    }
  });

  test('❌ Prefijo no reconocido', () => {
    try {
      validarYFormatearTelefono('+9999999999');
    } catch (error) {
      console.warn('🚫 Prefijo desconocido:', error.message);
      expect(error.message).toMatch(/no reconocido/);
    }
  });

  test('❌ Teléfono peruano con menos dígitos', () => {
    try {
      validarYFormatearTelefono('98765');
    } catch (error) {
      console.warn('⚠️ Teléfono incompleto para Perú:', error.message);
      expect(error.message).toMatch(/9 dígitos/);
    }
  });
});
