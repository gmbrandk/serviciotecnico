const mongoose = require('mongoose');
const { Equipo } = require('@models/Equipo');
const { ValidationError } = require('@utils/errors');
const normalizeField = require('@utils/normalizeField');
const { maskSensitive } = require('@utils/masking');

const MAX_LIMIT = 10;
const MIN_CHARS = 3;

module.exports = async function buscarEquiposService({
  id,
  texto,
  marca,
  tipo,
  nroSerie,
  sku,
  imei,
  macAddress,
  mode = 'autocomplete',
  limit,
}) {
  const isLookup = mode === 'lookup';
  const lim = Math.min(Math.max(Number(limit || MAX_LIMIT), 1), MAX_LIMIT);

  // 🔍 Lookup directo por ID
  if (id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError({ code: 'INVALID_ID', message: 'ID inválido' });
    }

    const equipo = await Equipo.findById(id).lean();
    if (!equipo) {
      throw new ValidationError({
        code: 'NOT_FOUND',
        message: 'Equipo no encontrado',
      });
    }

    // 👉 Shape consistente (sin enmascarar)
    return {
      count: 1,
      mode: 'lookup',
      results: [
        {
          _id: equipo._id,
          modelo: equipo.modelo || '',
          sku: equipo.sku || '',
          marca: equipo.marca || '',
          tipo: equipo.tipo || '',
          nroSerie: equipo.nroSerie || '',
          imei: equipo.imei || '',
          macAddress: equipo.macAddress || '',
          estado: equipo.estado || '',
        },
      ],
    };
  }

  // ✅ Validar criterios
  const qProvided = [texto, marca, tipo, nroSerie, sku, imei, macAddress].some(
    (v) => v && v.trim().length > 0
  );
  if (!qProvided) {
    throw new ValidationError({
      code: 'SEARCH_NO_QUERY',
      message: 'Debes enviar al menos un criterio de búsqueda.',
    });
  }

  // ⚠️ Longitud mínima en autocomplete
  if (!isLookup) {
    const short = [texto, marca, tipo, nroSerie, sku, imei, macAddress].some(
      (v) => v && v.length < MIN_CHARS
    );
    if (short) {
      throw new ValidationError({
        code: 'SEARCH_MIN_CHARS',
        message: `Para autocompletar, usa al menos ${MIN_CHARS} caracteres.`,
      });
    }
  }

  const query = {};

  // 🔧 Normalizados exactos
  if (sku)
    query.skuNormalizado = normalizeField(sku, {
      uppercase: true,
      removeNonAlnum: true,
    }).normalizado;
  if (nroSerie)
    query.nroSerieNormalizado = normalizeField(nroSerie, {
      uppercase: true,
      removeNonAlnum: true,
    }).normalizado;
  if (imei)
    query.imeiNormalizado = normalizeField(imei, {
      uppercase: true,
      removeNonAlnum: true,
    }).normalizado;
  if (macAddress)
    query.macAddressNormalizado = normalizeField(macAddress, {
      uppercase: true,
      removeNonAlnum: true,
    }).normalizado;

  // 🔧 Campos no normalizados
  if (marca) query.marca = new RegExp(marca.trim(), 'i');
  if (tipo) query.tipo = new RegExp(tipo.trim(), 'i');

  // 🔍 Texto libre
  if (texto) {
    const regex = new RegExp(texto.trim(), 'i');
    const normalizedText = normalizeField(texto, {
      uppercase: true,
      removeNonAlnum: true,
    }).normalizado;

    query.$or = [
      { modelo: regex },
      { sku: regex },
      { nroSerie: regex },
      { imei: regex },
      { macAddress: regex },
      { skuNormalizado: normalizedText },
      { nroSerieNormalizado: normalizedText },
      { imeiNormalizado: normalizedText },
      { macAddressNormalizado: normalizedText },
    ];
  }

  // 🎯 Proyección mínima
  const projection = isLookup
    ? {
        modelo: 1,
        sku: 1,
        nroSerie: 1,
        marca: 1,
        tipo: 1,
        imei: 1,
        macAddress: 1,
        estado: 1,
      }
    : {
        modelo: 1,
        sku: 1,
        nroSerie: 1,
        marca: 1,
        tipo: 1,
        imei: 1,
        macAddress: 1,
      };

  let equipos = await Equipo.find(query, projection).limit(lim).lean();

  // ✨ Post-procesamiento (solo autocomplete enmascara)
  if (!isLookup) {
    equipos = equipos.map((e) => ({
      _id: e._id,
      modelo: e.modelo || '',
      sku: e.sku || '',
      marca: e.marca || '',
      tipo: e.tipo || '',
      nroSerie: maskSensitive(e.nroSerie || ''),
      imei: maskSensitive(e.imei || ''),
      macAddress: maskSensitive(e.macAddress || ''),
    }));
  }

  return {
    count: equipos.length,
    mode,
    results: equipos,
  };
};
