const fs = require('fs');

describe('🧪 Test de ejemplo', () => {
  test('✅ Debe funcionar y registrar en log', () => {
    const logPath = expect.getState().logFilePath;
    fs.appendFileSync(logPath, '[🔍] Ejecutando lógica del test\n');

    const resultado = 2 + 2;
    fs.appendFileSync(logPath, `[✅] Resultado: ${resultado}\n`);

    expect(resultado).toBe(4);
  });

  test('🚫 Error intencional', () => {
    const logPath = expect.getState().logFilePath;
    fs.appendFileSync(logPath, '[⚠️] Este test va a fallar\n');
    expect(1).toBe(2);
  });
});
