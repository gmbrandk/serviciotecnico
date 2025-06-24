const { exec } = require('child_process');
const open = require('open').default;
const path = require('path');
const fs = require('fs');

const testFile = process.argv[2];
const withCoverage = process.argv.includes('--coverage');

const testFileName = testFile
  ? path.basename(testFile).replace(/\.[jt]sx?$/, '')
  : 'all-tests';

const reportFileName = `test-report-${testFileName}.html`;
const reportPath = path.resolve(__dirname, '__tests__/report', reportFileName);

// 🧠 Generar config dinámica de Jest completa
const jestConfigPath = path.resolve(__dirname, 'jest.config.report.js');
const jestConfig = `
module.exports = {
  rootDir: './',
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  moduleNameMapper: {
    '^@controllers(.*)$': '<rootDir>/controllers$1',
    '^@routes(.*)$': '<rootDir>/routes$1',
    '^@models(.*)$': '<rootDir>/models$1',
    '^@middlewares(.*)$': '<rootDir>/middlewares$1',
    '^@config(.*)$': '<rootDir>/config$1',
    '^@utils(.*)$': '<rootDir>/utils$1',
    '^@services(.*)$': '<rootDir>/services$1',
    '^@helpers(.*)$': '<rootDir>/helpers$1',
    '^app$': '<rootDir>/app.js'
  },
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        pageTitle: '🧪 Reporte de Pruebas - ${testFileName}',
        outputPath: '${reportPath.replace(/\\/g, '\\\\')}',
        includeFailureMsg: true,
        includeConsoleLog: true,
        sort: 'status',
        theme: 'darkTheme'
      }
    ]
  ]
};
`;

fs.writeFileSync(jestConfigPath, jestConfig);

const jestCommand = [
  'npx jest',
  testFile || '',
  `--config=${jestConfigPath}`,
  '--runInBand',
  '--forceExit',
  '--detectOpenHandles',
  '--verbose',
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
