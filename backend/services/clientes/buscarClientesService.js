const mongoose = require('mongoose');
const Cliente = require('@models/Cliente');
const { ValidationError } = require('@utils/errors');
const {
  maskDni,
  maskPhone,
  maskEmail,
  maskNames,
  maskApellidos,
} = require('@utils/masking');
const {
  normalizeDigits,
  safeLevenshtein,
  cleanPhone,
} = require('@utils/searchHelpers');

const MAX_LIMIT = 10;
const MIN_CHARS = 3;

module.exports = async function buscarClientesService({
  id,
  dni,
  nombre,
  telefono,
  email,
  mode = 'autocomplete',
  limit,
}) {
  const isLookup = mode === 'lookup';
  const lim = Math.min(Math.max(Number(limit || MAX_LIMIT), 1), MAX_LIMIT);

  // 🔍 Lookup por ID
  if (id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError({
        code: 'INVALID_ID',
        message: 'ID inválido',
      });
    }
    const cliente = await Cliente.findById(id).lean();
    if (!cliente) {
      throw new ValidationError({
        code: 'NOT_FOUND',
        message: 'Cliente no encontrado',
      });
    }
    return {
      count: 1,
      mode: 'lookup',
      results: [cliente],
    };
  }

  // ✅ Validación de query
  const qProvided = [dni, nombre, telefono, email].some(
    (v) => v && v.length > 0
  );
  if (!qProvided) {
    throw new ValidationError({
      code: 'SEARCH_NO_QUERY',
      message:
        'Debes enviar al menos un parámetro de búsqueda (dni, nombre, teléfono o email).',
    });
  }

  // ⚠️ Validación min chars
  if (!isLookup) {
    const short = [dni, nombre, telefono, email].some(
      (v) => v && v.length < MIN_CHARS && v.length > 0
    );
    if (short) {
      throw new ValidationError({
        code: 'SEARCH_MIN_CHARS',
        message: `Para autocompletar, usa al menos ${MIN_CHARS} caracteres.`,
      });
    }
  }

  // 🔎 Construcción de filtros
  const conditions = [];
  if (dni) {
    const onlyDigits = normalizeDigits(dni);
    if (!/^\d+$/.test(onlyDigits)) {
      throw new ValidationError({
        code: 'DNI_INVALID',
        message: 'El DNI solo debe contener dígitos.',
      });
    }
    if (isLookup) {
      if (onlyDigits.length !== 8) {
        throw new ValidationError({
          code: 'DNI_LENGTH',
          message: 'El DNI debe tener exactamente 8 dígitos.',
        });
      }
      conditions.push({ dni: onlyDigits });
    } else {
      conditions.push({ dni: { $regex: '^' + onlyDigits, $options: 'i' } });
    }
  }
  if (telefono) {
    const phoneNorm = cleanPhone(telefono);
    conditions.push({ telefono: { $regex: phoneNorm } });
  }
  if (email) {
    const emailQ = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    conditions.push({ email: { $regex: emailQ, $options: 'i' } });
  }
  if (nombre) {
    const nombreQ = nombre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    conditions.push({ nombre: { $regex: nombreQ, $options: 'i' } });
  }

  const query = conditions.length > 1 ? { $and: conditions } : conditions[0];

  // 🎯 Proyección
  const projection = isLookup
    ? {
        dni: 1,
        nombres: 1,
        apellidos: 1,
        telefono: 1,
        email: 1,
        direccion: 1,
        estado: 1,
      }
    : { dni: 1, nombres: 1, apellidos: 1, telefono: 1, email: 1, direccion: 1 };

  let docs = await Cliente.find(query, projection).limit(lim).lean();

  // Post-procesamiento para autocomplete
  let clientes = docs;
  if (!isLookup) {
    if (nombre) {
      clientes = clientes
        .map((c) => ({
          ...c,
          _score: safeLevenshtein(
            nombre.toUpperCase(),
            String(c.nombres || '').toUpperCase()
          ),
        }))
        .sort((a, b) => a._score - b._score);
    }

    clientes = clientes.map((c) => ({
      _id: c._id,
      dni: maskDni(c.dni),
      nombres: maskNames(c.nombres),
      apellidos: maskApellidos(c.apellidos),
      telefono: maskPhone(c.telefono),
      email: maskEmail(c.email),
      direccion: c.direccion,
    }));
  }

  // 👇 Detectar caso especial: DNI completo, válido y sin resultados
  let isNew = false;
  if (
    !isLookup &&
    dni &&
    normalizeDigits(dni).length === 8 &&
    clientes.length === 0
  ) {
    isNew = true;
  }

  return {
    count: clientes.length,
    mode,
    isNew, // 🚀 NUEVO FLAG
    results: clientes,
  };
};
