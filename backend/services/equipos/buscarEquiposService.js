// 📂 services/equipos/buscarEquiposService.js
const { Equipo } = require('@models/Equipo');
const normalizeField = require('@utils/normalizeField');

async function buscarEquiposService(query) {
  const {
    id,
    texto,
    marca,
    tipo,
    nroSerie,
    sku,
    imei,
    macAddress,
    mode = 'autocomplete',
    limit = 10,
  } = query;

  const filter = {};

  // 🔍 Búsqueda directa por ID
  if (id) {
    filter._id = id;
  }

  // 🔍 Búsqueda Google-like (regex sobre varios campos normalizados)
  if (texto) {
    const norm = normalizeField(texto, {
      uppercase: true,
      removeNonAlnum: true,
    }).normalizado;

    filter.$or = [
      { marca: new RegExp(texto, 'i') },
      { modelo: new RegExp(texto, 'i') },
      { skuNormalizado: new RegExp(norm, 'i') },
      { nroSerieNormalizado: new RegExp(norm, 'i') },
      { imeiNormalizado: new RegExp(norm, 'i') },
      { macAddressNormalizado: new RegExp(norm, 'i') },
    ];
  }

  // 🔍 Filtros exactos
  if (marca) filter.marca = new RegExp(marca, 'i');
  if (tipo) filter.tipo = new RegExp(tipo, 'i');

  if (nroSerie) {
    filter.nroSerieNormalizado = normalizeField(nroSerie, {
      uppercase: true,
      removeNonAlnum: true,
    }).normalizado;
  }
  if (sku) {
    filter.skuNormalizado = normalizeField(sku, {
      uppercase: true,
      removeNonAlnum: true,
    }).normalizado;
  }
  if (imei) {
    filter.imeiNormalizado = normalizeField(imei, {
      uppercase: true,
      removeNonAlnum: true,
    }).normalizado;
  }
  if (macAddress) {
    filter.macAddressNormalizado = normalizeField(macAddress, {
      uppercase: true,
      removeNonAlnum: true,
    }).normalizado;
  }

  // 🔍 Lookup: búsqueda exacta por ID (sin maskSensitive)
  if (mode === 'lookup' && id) {
    const equipo = await Equipo.findOne(filter).lean();
    return equipo
      ? { count: 1, results: [equipo], mode }
      : { count: 0, results: [], mode };
  }

  // 🔍 Autocomplete (default)
  const results = await Equipo.find(filter)
    .limit(Number(limit))
    .select('modelo sku marca tipo nroSerie imei macAddress')
    .lean();

  // En autocomplete se enmascaran campos sensibles
  const masked = results.map((e) => ({
    ...e,
    nroSerie: e.nroSerie ? e.nroSerie.replace(/.(?=.{4})/g, '*') : null,
    imei: e.imei ? e.imei.replace(/.(?=.{4})/g, '*') : null,
    macAddress: e.macAddress ? e.macAddress.replace(/.(?=.{4})/g, '*') : null,
  }));

  return {
    count: results.length,
    results: masked,
    mode,
  };
}

module.exports = buscarEquiposService;
