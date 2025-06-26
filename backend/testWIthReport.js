const { exec } = require('child_process');
const open = require('open').default; // ✅ corrección
const path = require('path');

const testFile = process.argv[2]; // archivo de test (opcional)
const withCoverage = process.argv.includes('--coverage'); // activar cobertura

const reportPath = path.resolve(__dirname, '__tests__/report/test-report.html');

const jestCommand = [
  'npx jest',
  testFile || '',
  '--runInBand',
  '--forceExit',
  '--detectOpenHandles',
  '--verbose',
  '--reporters=default',
  '--reporters=jest-html-reporter',
  withCoverage ? '--coverage' : '',
].join(' ');

console.log(`🚀 Ejecutando tests: ${testFile || 'todos los archivos'}...\n`);

exec(jestCommand, async (err, stdout, stderr) => {
  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);

  if (err) {
    console.error('❌ Fallo en los tests');
    process.exit(1);
  }

  console.log(`\n📄 Abriendo reporte: ${reportPath}`);
  await open(reportPath);
});
