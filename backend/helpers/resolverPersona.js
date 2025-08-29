// 📌 services/clientes/helpers/resolverPersona.js
const Cliente = require('@models/Cliente');
const crearClienteService = require('@services/clientes/crearClienteService');
const obtenerClientesService = require('@services/clientes/obtenerClientesService');

/**
 * Resuelve un cliente/representante.
 * @param {String|Object} persona - Puede ser un ObjectId (string) o un objeto con datos.
 * @param {Object} session - Sesión de mongoose (transacción).
 * @returns {Promise<Cliente>}
 */
const resolverPersona = async (persona, session) => {
  let personaFinal = null;

  if (!persona) return null;

  // 📌 Caso: viene como string (ObjectId)
  if (typeof persona === 'string') {
    personaFinal = await obtenerClientesService({ id: persona });
    return personaFinal;
  }

  // 📌 Caso: objeto con datos
  let existente = null;

  if (persona.dni) {
    existente = await Cliente.findOne({ dni: persona.dni }).session(session);
  }
  if (!existente && persona.email) {
    existente = await Cliente.findOne({ email: persona.email }).session(
      session
    );
  }
  if (!existente && persona.telefono) {
    existente = await Cliente.findOne({ telefono: persona.telefono }).session(
      session
    );
  }

  if (existente) {
    personaFinal = existente;
  } else {
    personaFinal = await crearClienteService(persona, { session });
  }

  return personaFinal;
};

module.exports = resolverPersona;
