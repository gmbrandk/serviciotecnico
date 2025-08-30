// 📌 services/clientes/helpers/resolverPersona.js
const Cliente = require('@models/Cliente');
const crearClienteService = require('@services/clientes/crearClienteService');
const { ValidationError } = require('@utils/errors');

/**
 * Normaliza datos clave para evitar duplicados por formato.
 */
const normalizarEmail = (email = '') => email.trim().toLowerCase();
const normalizarTelefono = (tel = '') => tel.replace(/\D/g, ''); // solo dígitos

/**
 * Resuelve un cliente/representante.
 * @param {String|Object} persona - Puede ser un ObjectId (string) o un objeto con datos.
 * @param {Object} session - Sesión de mongoose (transacción).
 * @returns {Promise<Cliente>}
 */
const resolverPersona = async (persona, session) => {
  if (!persona) return null;

  // 📌 Caso: viene como string (ObjectId)
  if (typeof persona === 'string') {
    const encontrado = await Cliente.findById(persona).session(session);
    if (!encontrado) throw new ValidationError('Cliente no encontrado');
    return encontrado;
  }

  // 📌 Caso: objeto con datos
  const query = [];
  if (persona.dni) query.push({ dni: persona.dni });
  if (persona.email) query.push({ email: normalizarEmail(persona.email) });
  if (persona.telefono)
    query.push({ telefono: normalizarTelefono(persona.telefono) });

  let existente = null;
  if (query.length > 0) {
    existente = await Cliente.findOne({ $or: query }).session(session);
  }

  if (existente) return existente;

  // Crear nuevo cliente
  const nuevo = await crearClienteService(
    {
      ...persona,
      email: persona.email ? normalizarEmail(persona.email) : undefined,
      telefono: persona.telefono
        ? normalizarTelefono(persona.telefono)
        : undefined,
    },
    { session }
  );

  return nuevo;
};

module.exports = resolverPersona;
