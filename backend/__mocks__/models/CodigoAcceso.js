// __mocks__/@models/CodigoAcceso.js

const jestMock = require('jest-mock');

class FakeCodigoAcceso {
  constructor(data) {
    Object.assign(this, data);
    this.usosDisponibles = data.usosDisponibles ?? 1;
    this.save = jestMock.fn().mockResolvedValue(this);
  }
}

// Métodos estáticos mockeados
FakeCodigoAcceso.findOne = jestMock.fn().mockResolvedValue(null);

module.exports = FakeCodigoAcceso;
