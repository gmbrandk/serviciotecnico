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
 * ⚠️ Nota: NO asigna clienteActual. Eso se hace en el servicio principal.
 */
const resolverEquipo = async (equipo, session) => {
  if (!equipo) return null;

  // 📌 Caso: viene como string (ObjectId)
  if (typeof equipo === 'string') {
    const encontrado = await Equipo.findById(equipo).session(session);
    if (!encontrado) throw new ValidationError('Equipo no encontrado');
    return encontrado;
  }

  // 📌 Caso: objeto con datos → buscar por nroSerieNormalizado primero
  let existente = null;

  if (equipo.nroSerie) {
    existente = await Equipo.findOne({
      nroSerieNormalizado: normalizarSerie(equipo.nroSerie),
    }).session(session);
  }

  // Si no se encontró por serie, intentar por IMEI o MAC
  if (!existente && (equipo.imei || equipo.macAddress)) {
    existente = await Equipo.findOne({
      $or: [
        equipo.imei ? { imei: equipo.imei } : null,
        equipo.macAddress ? { macAddress: equipo.macAddress } : null,
      ].filter(Boolean),
    }).session(session);
  }

  // Crear equipo si no existe
  if (!existente) {
    existente = await crearEquipoService(
      {
        ...equipo,
        nroSerieNormalizado: equipo.nroSerie
          ? normalizarSerie(equipo.nroSerie)
          : undefined,
      },
      { session }
    );
  }

  return existente;
};

module.exports = resolverEquipo;
