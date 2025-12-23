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

  const hasSearchIntent = Boolean(
    texto || marca || tipo || nroSerie || sku || imei || macAddress
  );

  // 🔍 Lookup directo (ID o nroSerie)
  if (mode === 'lookup' && (id || nroSerie)) {
    let equipo = null;

    if (id) {
      equipo = await Equipo.findById(id).lean();
    } else {
      const normSerie = normalizeField(nroSerie, {
        uppercase: true,
        removeNonAlnum: true,
      }).normalizado;

      equipo = await Equipo.findOne({ nroSerieNormalizado: normSerie }).lean();
    }

    return {
      count: equipo ? 1 : 0,
      results: equipo ? [equipo] : [],
      mode,
      isNew: false, // 🔒 lookup nunca habilita creación
    };
  }

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

  const results = await Equipo.find(filter)
    .limit(Number(limit))
    .select('modelo sku marca tipo nroSerie imei macAddress')
    .lean();

  // 🔒 Enmascarado (autocomplete)
  const masked = results.map((e) => ({
    ...e,
    nroSerie: e.nroSerie ? e.nroSerie.replace(/.(?=.{4})/g, '*') : null,
    imei: e.imei ? e.imei.replace(/.(?=.{4})/g, '*') : null,
    macAddress: e.macAddress ? e.macAddress.replace(/.(?=.{4})/g, '*') : null,
  }));

  const isNew =
    mode === 'autocomplete' && hasSearchIntent && masked.length === 0;

  return {
    count: masked.length,
    results: masked,
    mode,
    isNew,
  };
}

module.exports = buscarEquiposService;
