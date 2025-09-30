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

  // 🔍 Búsqueda Google-like
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

  // 🔍 Lookup directo (por ID o nroSerie)
  if (mode === 'lookup' && (id || nroSerie)) {
    let equipo = null;

    if (id) {
      equipo = await Equipo.findOne({ _id: id }).lean();
    } else if (nroSerie) {
      const normSerie = normalizeField(nroSerie, {
        uppercase: true,
        removeNonAlnum: true,
      }).normalizado;
      equipo = await Equipo.findOne({ nroSerieNormalizado: normSerie }).lean();
    }

    return equipo
      ? { count: 1, results: [equipo], mode, isNew: false }
      : { count: 0, results: [], mode, isNew: true };
  }

  // 🔍 Autocomplete
  if (nroSerie) {
    filter.nroSerieNormalizado = normalizeField(nroSerie, {
      uppercase: true,
      removeNonAlnum: true,
    }).normalizado;
  }

  const results = await Equipo.find(filter)
    .limit(Number(limit))
    .select('modelo sku marca tipo nroSerie imei macAddress')
    .lean();

  // 🔹 En autocomplete se enmascaran campos sensibles
  const masked = results.map((e) => ({
    ...e,
    nroSerie: e.nroSerie ? e.nroSerie.replace(/.(?=.{4})/g, '*') : null,
    imei: e.imei ? e.imei.replace(/.(?=.{4})/g, '*') : null,
    macAddress: e.macAddress ? e.macAddress.replace(/.(?=.{4})/g, '*') : null,
  }));

  // 🔹 Calcular flag `isNew` → si el usuario buscó un nroSerie específico y no hay match
  let isNew = false;
  if (nroSerie) {
    const normSerie = normalizeField(nroSerie, {
      uppercase: true,
      removeNonAlnum: true,
    }).normalizado;

    const exists = await Equipo.exists({ nroSerieNormalizado: normSerie });
    isNew = !exists;
  }

  return {
    count: results.length,
    results: masked,
    mode,
    isNew,
  };
}

module.exports = buscarEquiposService;
