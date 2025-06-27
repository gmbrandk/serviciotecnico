const { exec } = require('child_process');
const open = require('open').default;
const path = require('path');
const fs = require('fs');
const { initLogger, log, closeLogger } = require('./testLogger'); // ✅ destructurado

const testFile = process.argv[2];
const withCoverage = process.argv.includes('--coverage');

const testFileName = testFile
  ? path.basename(testFile).replace(/\.[jt]sx?$/, '')
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
initLogger(testFile);
log(`🚀 Iniciando ejecución de: ${testFile || 'todos los tests'}...`);

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
    log(stdout);
  }
  if (stderr) {
    console.error(stderr);
    log(stderr);
  }

  if (err) {
    log('❌ Fallo en los tests');
    closeLogger();
    process.exit(1);
  }

  log('✅ Tests finalizados correctamente');
  closeLogger();

  console.log(`\n📄 Abriendo reporte: ${reportPath}`);
  await open(reportPath);
});
