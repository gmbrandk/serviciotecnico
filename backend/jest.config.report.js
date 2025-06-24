
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
        pageTitle: '🧪 Reporte de Pruebas - clientes.int.test',
        outputPath: 'C:\\Users\\MSI\\serviciotecnico-v28\\backend\\__tests__\\report\\test-report-clientes.int.test.html',
        includeFailureMsg: true,
        includeConsoleLog: true,
        sort: 'status',
        theme: 'darkTheme'
      }
    ]
  ]
};
