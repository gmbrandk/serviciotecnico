const mongoose = require('mongoose');
const Cliente = require('@models/Cliente');

const obtenerClientesService = async ({
  id = null,
  filtros = {},
  opciones = {},
}) => {
  // 🔹 Caso 1: obtener por ID
  if (id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw { status: 400, mensaje: 'ID inválido' };
    }
    const cliente = await Cliente.findById(id).lean();
    if (!cliente)
      throw { status: 404, mensaje: `Cliente con id ${id} no encontrado` };
    return { cliente };
  }

  // 🔹 Caso 2: listado con filtros
  const { page = 1, limit = 20, sortBy = 'nombres', order = 'asc' } = opciones;
  const skip = (page - 1) * limit;
  const sort = { [sortBy]: order === 'desc' ? -1 : 1 };

  // ⚡ Normalización de filtros según schema
  const filtrosMongo = {};

  if ('estado' in filtros) filtrosMongo.estado = filtros.estado; // activo/suspendido/baneado
  if ('calificacion' in filtros)
    filtrosMongo.calificacion = filtros.calificacion; // enum
  if ('isActivo' in filtros)
    filtrosMongo.isActivo = filtros.isActivo === 'true'; // boolean

  // Búsqueda parcial por nombres y apellidos
  if (filtros.nombres)
    filtrosMongo.nombres = new RegExp(filtros.nombres.trim(), 'i');
  if (filtros.apellidos)
    filtrosMongo.apellidos = new RegExp(filtros.apellidos.trim(), 'i');

  if (filtros.dni) filtrosMongo.dni = new RegExp(filtros.dni.trim(), 'i');
  if (filtros.telefono)
    filtrosMongo.telefono = new RegExp(filtros.telefono.trim(), 'i');
  if (filtros.email) filtrosMongo.email = new RegExp(filtros.email.trim(), 'i');

  const clientes = await Cliente.find(filtrosMongo)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Cliente.countDocuments(filtrosMongo);

  return { clientes, total, page, limit };
};

module.exports = obtenerClientesService;
