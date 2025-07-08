const request = require('supertest');
const app = require('app');
const FichaTecnica = require('@models/FichaTecnica');
const generarNombreTecnico = require('../../utils/formatters/normalizarNombreTecnico');

describe('POST /api/ficha-tecnica', () => {
  const input = {
    modelo: 'Legión Y545  81Q6', // con tilde y doble espacio
    sku: '81Q6000QUS',
    marca: 'lenovo', // minúsculas
    cpu: 'Intel Core i7',
    gpu: 'GTX 1660 Ti',
    ram: '16GB DDR4',
    almacenamiento: '512GB NVMe',
    fuente: 'manual',
  };

  const nombreTecnicoEsperado = generarNombreTecnico(input.marca, input.modelo);

  beforeAll(async () => {
    await FichaTecnica.deleteMany({});
  });

  it('crea ficha técnica y normaliza nombreTecnico correctamente', async () => {
    const res = await request(app).post('/api/ficha-tecnica').send(input);

    console.log('[STATUS]:', res.status);
    console.log('[RESPONSE]:', res.body);

    expect(res.status).toBe(201);
    expect(res.body.ficha).toBeDefined();
    expect(res.body.ficha.nombreTecnico).toBe(nombreTecnicoEsperado);

    //console.log(`[DB]: Busqueda en base de datos para: ${res.body.ficha.nombreTecnico} por SKU: ${res.body.ficha.sku}`);
    // Verificar en DB
    const fichaDB = await FichaTecnica.findOne({ sku: input.sku })
      .select('+nombreTecnico')
      .lean();

    expect(fichaDB).not.toBeNull();
    expect(fichaDB.nombreTecnico).toBe(nombreTecnicoEsperado);
    expect(fichaDB.modelo).toBe(input.modelo.trim()); // según cómo lo guardes
  });

  it('busca correctamente una ficha técnica por modelo y marca', async () => {
    const query = {
      modelo: input.modelo,
      marca: input.marca,
    };

    const url = `/api/ficha-tecnica?modelo=${encodeURIComponent(
      query.modelo
    )}&marca=${encodeURIComponent(query.marca)}`;
    console.log('🔍 [TEST] Consulta GET:', url);

    const res = await request(app).get('/api/ficha-tecnica').query(query);

    console.log('📥 [RESPONSE STATUS]:', res.status);
    console.log('📦 [RESPONSE BODY]:', JSON.stringify(res.body, null, 2));

    expect(res.status).toBe(200);
    expect(res.body.resultados).toBeInstanceOf(Array);
    expect(res.body.resultados.length).toBeGreaterThan(0);

    const resultado = res.body.resultados[0];

    console.log('✅ [MATCH FOUND]:', {
      modelo: resultado.modelo,
      sku: resultado.sku,
      nombreTecnico: resultado.nombreTecnico,
    });

    expect(resultado.nombreTecnico).toBe(nombreTecnicoEsperado);
    expect(resultado.modelo).toBe(input.modelo.trim());
    expect(resultado.sku).toBe(input.sku);
  });

  afterAll(async () => {
    await FichaTecnica.deleteMany({});
  });
});
