// __tests__/sanity.test.js
const { conectarDB, desconectarDB } = require('./setup');

beforeAll(async () => {
  await conectarDB();
});

afterAll(async () => {
  await desconectarDB();
});

test('🧪 Sanity test: la conexión a MongoDB funciona', async () => {
  expect(true).toBe(true);
});
