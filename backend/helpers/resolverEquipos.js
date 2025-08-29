const resolverEquipo = require('./resolverEquipo');

/**
 * Resuelve múltiples equipos (existentes o nuevos).
 * @param {Array<String|Object>} equipos - Lista de equipos como IDs o objetos.
 * @param {Object} session - Sesión de mongoose.
 * @param {Object} clienteFinal - Cliente al que se asignan los equipos.
 * @returns {Promise<Array>}
 */
const resolverEquipos = async (equipos = [], session, clienteFinal) => {
  if (!Array.isArray(equipos)) {
    throw new Error('El parámetro equipos debe ser un array');
  }

  const resultados = await Promise.all(
    equipos.map((equipo) => resolverEquipo(equipo, session, clienteFinal))
  );

  return resultados;
};

module.exports = resolverEquipos;
