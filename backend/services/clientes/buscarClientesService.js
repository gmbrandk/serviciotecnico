// services/clientes/buscarClientesService.js
const Cliente = require('@models/Cliente');
const { ValidationError } = require('@utils/errors');
const { maskDni, maskPhone, maskEmail } = require('@utils/masking');
const {
  normalizeDigits,
  safeLevenshtein,
  cleanPhone,
} = require('@utils/searchHelpers');

const MAX_LIMIT = 10;
const MIN_CHARS = 3;

module.exports = async function buscarClientesService(params) {
  const {
    dni,
    nombre,
    telefono,
    email,
    mode = 'autocomplete',
    limit,
    requester,
  } = params;

  // 1) Validaciones de entrada
  const qProvided = [dni, nombre, telefono, email].some(
    (v) => v && v.length > 0
  );
  if (!qProvided) {
    throw new ValidationError({
      code: 'SEARCH_NO_QUERY',
      message:
        'Debes enviar al menos un parámetro de búsqueda (dni, nombre, teléfono o email).',
      details: null,
    });
  }

  const lim = Math.min(Math.max(Number(limit || MAX_LIMIT), 1), MAX_LIMIT);

  // Autocomplete exige mínimo 3 caracteres (excepto lookup exacto)
  const isLookup = mode === 'lookup';
  if (!isLookup) {
    const short = [dni, nombre, telefono, email].some(
      (v) => v && v.length < MIN_CHARS
    );
    if (short) {
      throw new ValidationError({
        code: 'SEARCH_MIN_CHARS',
        message: `Para autocompletar, usa al menos ${MIN_CHARS} caracteres.`,
        details: { min: MIN_CHARS },
      });
    }
  }

  // 2) Construir filtro seguro
  const conditions = [];
  const warnings = [];

  // DNI: política estricta
  if (dni) {
    const onlyDigits = normalizeDigits(dni);
    if (!/^\d+$/.test(onlyDigits)) {
      throw new ValidationError({
        code: 'DNI_INVALID',
        message: 'El DNI solo debe contener dígitos.',
      });
    }
    if (isLookup) {
      // lookup: permite exact match si son 8 dígitos, o rechaza
      if (onlyDigits.length !== 8) {
        throw new ValidationError({
          code: 'DNI_LENGTH',
          message:
            'El DNI debe tener exactamente 8 dígitos para búsqueda exacta.',
        });
      }
      conditions.push({ dni: onlyDigits });
    } else {
      // autocomplete: permite prefijo (sin exponer fuzzy)
      conditions.push({ dni: { $regex: '^' + onlyDigits, $options: 'i' } });
    }
  }

  // TELÉFONO: normaliza y permite prefix-regex
  if (telefono) {
    const phoneNorm = cleanPhone(telefono);
    if (phoneNorm.length < MIN_CHARS && !isLookup) {
      throw new ValidationError({
        code: 'PHONE_MIN_CHARS',
        message: `Teléfono requiere al menos ${MIN_CHARS} dígitos.`,
      });
    }
    conditions.push({ telefono: { $regex: phoneNorm } }); // no ^ para permitir contiene
  }

  // EMAIL: case-insensitive partial
  if (email) {
    const emailQ = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape regex
    conditions.push({ email: { $regex: emailQ, $options: 'i' } });
  }

  // NOMBRE: case-insensitive partial
  if (nombre) {
    const nombreQ = nombre.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    conditions.push({ nombre: { $regex: nombreQ, $options: 'i' } });
  }

  // 3) Ejecutar búsqueda (AND entre campos provistos)
  const query = conditions.length > 1 ? { $and: conditions } : conditions[0];

  // Proyección minimal según modo:
  // - autocomplete: NO exponer datos completos → enmascarar después
  // - lookup: puedes devolver más campos (pero igual moderado)
  const projection = isLookup
    ? { dni: 1, nombre: 1, telefono: 1, email: 1, estado: 1 }
    : { dni: 1, nombre: 1, telefono: 1, email: 1 }; // minimal

  // Índices recomendados en el modelo:
  // dni (unique), telefono (unique), email (unique), nombre (index text o normal con collation)
  const docs = await Cliente.find(query, projection).limit(lim).lean();

  // 4) Post-procesado seguro
  let clientes = docs;

  // Fuzzy SAFE (solo autocomplete y solo para nombre/email/teléfono).
  // Nunca hacer DidYouMean para DNI.
  if (!isLookup) {
    // Si vino "nombre", ordena por similitud con el término
    if (nombre) {
      clientes = clientes
        .map((c) => ({
          ...c,
          _score: safeLevenshtein(
            nombre.toUpperCase(),
            String(c.nombre || '').toUpperCase()
          ),
        }))
        .sort((a, b) => a._score - b._score); // menor distancia = mejor
    }

    // Enmascarar datos sensibles en autocomplete
    clientes = clientes.map((c) => ({
      _id: c._id,
      dni: maskDni(c.dni), // ****6129
      nombre: c.nombre,
      telefono: maskPhone(c.telefono), // +51 964****20
      email: maskEmail(c.email), // c*****m@gmail.com
    }));
  }

  // 5) Warning por DNIs “parecidos” (solo informativo, no sugerir exacto)
  // Si usuario envía un DNI de 8 dígitos en autocomplete, buscamos si hay otros DNIs a distancia 1
  if (!isLookup && dni) {
    const d = normalizeDigits(dni);
    if (d.length === 8) {
      // Busca candidatos por prefijo (los mismos docs ya traídos ayudan; si está vacío, hacemos un query más laxo)
      let reviewPool = docs;
      if (reviewPool.length === 0) {
        reviewPool = await Cliente.find(
          { dni: { $regex: d.slice(0, 5) } },
          { dni: 1, nombre: 1 }
        )
          .limit(5)
          .lean();
      }

      const similar = reviewPool
        .filter((x) => x.dni && safeLevenshtein(x.dni, d) === 1)
        .map((x) => ({ dni: maskDni(x.dni), nombre: x.nombre }));

      if (similar.length > 0) {
        warnings.push({
          code: 'DNI_SIMILAR',
          message:
            'Existen DNIs muy similares al ingresado. Verifica con el cliente antes de continuar.',
          candidates: similar.slice(0, 3), // no exponer de más
        });
      }
    }
  }

  return {
    clientes,
    warnings: warnings.length ? warnings : undefined,
    mode,
    count: clientes.length,
  };
};
