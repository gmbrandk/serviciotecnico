const { exec } = require('child_process');
const open = require('open').default;
const path = require('path');
const fs = require('fs');
const testLogger = require('./testLogger');

// 🧪 Archivo test (opcional) y cobertura
const testFile = process.argv[2]; // ej: __tests__/clientes.int.test.js
const withCoverage = process.argv.includes('--coverage');

// 📄 Nombre del archivo base para el reporte y log
const testFileName = testFile
  ? path.basename(testFile).replace(/\.[jt]sx?$/, '') // sin extensión
  : 'all-tests';

const reportFileName = `test-report-${testFileName}.html`;
const reportPath = path.resolve(__dirname, '__tests__/report', reportFileName);

// 📝 Configuración temporal del reporter
const reporterConfigPath = path.resolve(
  __dirname,
  '__tests__/reporter-config.json'
);
fs.writeFileSync(
  reporterConfigPath,
  JSON.stringify({
    pageTitle: `Test Report - ${testFileName}`,
    outputPath: reportPath,
    includeFailureMsg: true,
    includeSuiteFailure: true,
    theme: 'darkTheme',
  })
);

// 🧾 Iniciar logger de este test
testLogger.initLogger(testFile); // ✅ ahora sí
testLogger.log(
  `🚀 Iniciando ejecución de: ${testFile || 'todos los tests'}...`
);

const jestCommand = [
  'npx jest',
  testFile || '',
  '--runInBand',
  '--forceExit',
  '--detectOpenHandles',
  '--verbose',
  `--reporters=default`,
  `--reporters=jest-html-reporter`,
  `--reporter-options=configFile=${reporterConfigPath}`,
  withCoverage ? '--coverage' : '',
].join(' ');

exec(jestCommand, async (err, stdout, stderr) => {
  if (stdout) {
    console.log(stdout);
    testLogger.log(stdout);
  }
  if (stderr) {
    console.error(stderr);
    testLogger.log(stderr);
  }

  if (err) {
    testLogger.log('❌ Fallo en los tests');
    testLogger.closeLogger();
    process.exit(1);
  }

  testLogger.log('✅ Tests finalizados correctamente');
  testLogger.closeLogger();

  console.log(`\n📄 Abriendo reporte: ${reportPath}`);
  await open(reportPath);
});
