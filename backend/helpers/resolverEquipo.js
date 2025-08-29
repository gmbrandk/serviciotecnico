const { Equipo } = require('@models/Equipo');
const crearEquipoService = require('@services/equipos/crearEquipoService');
const { ValidationError } = require('@utils/errors');

const resolverEquipo = async (equipo, clienteFinal, session) => {
  if (!equipo) return null;

  let equipoFinal = null;

  // 📌 Caso: ID (string)
  if (typeof equipo === 'string') {
    equipoFinal = await Equipo.findById(equipo).session(session);
    if (!equipoFinal) throw new ValidationError('Equipo no encontrado');
    return equipoFinal;
  }

  // 📌 Caso: objeto con datos
  const normalizarSerie = (str = '') =>
    str
      .toUpperCase()
      .replace(/O/g, '0')
      .replace(/I/g, '1')
      .replace(/L/g, '1')
      .replace(/S/g, '5');

  let existente = null;

  if (equipo.nroSerie) {
    const posibles = await Equipo.find({ nroSerie: { $exists: true } }).session(
      session
    );
    existente = posibles.find(
      (eq) => normalizarSerie(eq.nroSerie) === normalizarSerie(equipo.nroSerie)
    );
  }

  if (!existente) {
    existente = await Equipo.findOne({
      $or: [
        equipo.imei ? { imei: equipo.imei } : null,
        equipo.macAddress ? { macAddress: equipo.macAddress } : null,
      ].filter(Boolean),
    }).session(session);
  }

  equipoFinal =
    existente ||
    (await crearEquipoService(
      {
        ...equipo,
        clienteActual: clienteFinal._id, // 🔥 forzamos clienteActual aquí
      },
      { session }
    ));

  return equipoFinal;
};

module.exports = resolverEquipo;
