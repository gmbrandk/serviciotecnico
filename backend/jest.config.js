// jest.config.js
module.exports = {
    setupFiles: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
      '^@controllers(.*)$': '<rootDir>/controllers$1',
      '^@routes(.*)$': '<rootDir>/routes$1',
      '^@models(.*)$': '<rootDir>/models$1',
      '^@middlewares(.*)$': '<rootDir>/middlewares$1',
      '^@config(.*)$': '<rootDir>/config$1',
      '^@utils(.*)$': '<rootDir>/utils$1',
      '^app$': '<rootDir>/app.js'
    },
    testEnvironment: 'node'
  };
  