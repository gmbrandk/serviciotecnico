// 📌 services/equipos/helpers/resolverEquipo.js
const { Equipo } = require('@models/Equipo');
const crearEquipoService = require('@services/equipos/crearEquipoService');
const { ValidationError } = require('@utils/errors');

const normalizarSerie = (str = '') =>
  str
    .trim()
    .toUpperCase()
    .replace(/O/g, '0')
    .replace(/I|L/g, '1')
    .replace(/S/g, '5');

/**
 * Resuelve un equipo a partir de un ID o un objeto de datos.
 * ⚠️ Si es nuevo, se puede inicializar con clienteActual.
 */
const resolverEquipo = async (equipo, session, clienteId = null) => {
  if (!equipo) return null;

  // 📌 Caso: viene como string (ObjectId)
  if (typeof equipo === 'string') {
    const encontrado = await Equipo.findById(equipo)
      .populate('clienteActual')
      .session(session);
    if (!encontrado) throw new ValidationError('Equipo no encontrado');
    return encontrado;
  }

  // 📌 Caso: objeto con datos → buscar por nroSerieNormalizado primero
  let existente = null;

  if (equipo.nroSerie) {
    existente = await Equipo.findOne({
      nroSerieNormalizado: normalizarSerie(equipo.nroSerie),
    })
      .populate('clienteActual')
      .session(session);
  }

  // Si no se encontró por serie, intentar por IMEI o MAC
  if (!existente && (equipo.imei || equipo.macAddress)) {
    existente = await Equipo.findOne({
      $or: [
        equipo.imei ? { imei: equipo.imei } : null,
        equipo.macAddress ? { macAddress: equipo.macAddress } : null,
      ].filter(Boolean),
    })
      .populate('clienteActual')
      .session(session);
  }

  // Crear equipo si no existe
  if (!existente) {
    existente = await crearEquipoService(
      {
        ...equipo,
        clienteActual: clienteId, // 👈 ahora sí se asigna si lo recibimos
        nroSerieNormalizado: equipo.nroSerie
          ? normalizarSerie(equipo.nroSerie)
          : undefined,
      },
      { session }
    );
  }

  // 📌 Aseguramos devolver siempre clienteActual poblado
  return await Equipo.findById(existente._id)
    .populate('clienteActual')
    .session(session);
};

module.exports = resolverEquipo;
