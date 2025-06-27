const { exec } = require('child_process');
const open = require('open').default;
const path = require('path');

const testFile = process.argv[2]; // Ej: __tests__/clientes.int.test.js
const withCoverage = process.argv.includes('--coverage');

const jestCommand = [
  'cross-env',
  'NODE_ENV=test',
  'npx jest',
  testFile || '',
  '--config=jest.config.js',
  '--runInBand',
  '--forceExit',
  '--detectOpenHandles',
  '--reporters=default',
  '--reporters=jest-html-reporter',
  '--reporter-options=configFile=jest-html-reporter.config.json',
  withCoverage ? '--coverage' : '',
].join(' ');

console.log(`🚀 Ejecutando pruebas: ${testFile || 'todas'}...\n`);

exec(jestCommand, async (err, stdout, stderr) => {
  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);

  if (err) {
    console.error('❌ Error en pruebas');
    process.exit(1);
  }

  const reportPath = path.resolve(
    __dirname,
    '__tests__/report/test-report.html'
  );
  console.log(`\n📄 Abriendo reporte en: ${reportPath}`);
  await open(reportPath);
});
