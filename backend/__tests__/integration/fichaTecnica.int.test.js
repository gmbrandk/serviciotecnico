const request = require('supertest');
const app = require('app'); // tu instancia de express
const FichaTecnica = require('@models/FichaTecnica');
const generarNombreTecnico = require('../../utils/formatters/normalizarNombreTecnico');

describe('GET /api/ficha-tecnica', () => {
  const modelo = 'Legion Y545 81Q6';
  const marca = 'Lenovo';
  const nombreTecnico = generarNombreTecnico(marca, modelo);

  beforeAll(async () => {
    await FichaTecnica.create({
      modelo,
      sku: '81Q6000QUS',
      marca,
      nombreTecnico,
      cpu: 'Intel Core i7-9750H',
      gpu: 'NVIDIA GTX 1660 Ti',
      ram: '16GB DDR4',
      almacenamiento: '512GB PCIe NVMe',
      fuente: 'manual',
    });

    const doc = await FichaTecnica.findOne({ nombreTecnico });
    console.log('[CREADO EN DB]:', doc);
  });

  it('devuelve ficha técnica por modelo y marca', async () => {
    const query = { modelo, marca };
    const url = `/api/ficha-tecnica?modelo=${encodeURIComponent(
      query.modelo
    )}&marca=${encodeURIComponent(query.marca)}`;

    console.log('[REQUEST URL]:', url);

    const res = await request(app).get('/api/ficha-tecnica').query(query);

    console.log('[STATUS]:', res.status);
    console.log('[BODY]:', res.body);

    expect(res.status).toBe(200);
    expect(res.body.resultados.length).toBeGreaterThan(0);
  });

  afterAll(async () => {
    await FichaTecnica.deleteMany({});
  });
});
