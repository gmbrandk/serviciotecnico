// 📁 services/equipos/obtenerEquiposService.js
const mongoose = require('mongoose');
const { Equipo } = require('@models/Equipo');

const obtenerEquiposService = async ({
  id = null,
  filtros = {},
  opciones = {},
}) => {
  // 📌 Caso 1: obtener un equipo por ID
  if (id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw { status: 400, mensaje: 'ID de equipo inválido' };
    }

    const equipo = await Equipo.findById(id)
      .populate('fichaTecnica')
      .populate('clienteActual');

    if (!equipo) {
      throw { status: 404, mensaje: 'Equipo no encontrado' };
    }

    return equipo;
  }

  // 📌 Caso 2: obtener listado con filtros
  const query = {};

  // 🔹 Filtrar por cliente
  if (filtros.clienteId && mongoose.Types.ObjectId.isValid(filtros.clienteId)) {
    query.clienteActual = new mongoose.Types.ObjectId(filtros.clienteId);
  }

  // 🔹 Filtrar por estado
  if (filtros.estado) {
    if (filtros.estado === 'eliminado') query.activo = false;
    else query.estado = filtros.estado;
  }

  // 🔹 Filtrar por marca
  if (filtros.marca && filtros.marca.trim()) {
    query.marca = new RegExp(filtros.marca.trim(), 'i');
  }

  // 🔹 Filtrar por tipo
  if (filtros.tipo && filtros.tipo.trim()) {
    query.tipo = new RegExp(filtros.tipo.trim(), 'i');
  }

  // 🔹 Filtrar por texto libre (modelo, sku, nroSerie)
  if (filtros.texto && filtros.texto.trim()) {
    const regex = new RegExp(filtros.texto.trim(), 'i');
    query.$or = [
      { modelo: regex },
      { sku: regex },
      { nroSerie: regex },
      { imei: regex },
      { macAddress: regex },
    ];
  }

  // 🔹 Paginación y orden
  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    order = 'desc',
  } = opciones;

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: order === 'desc' ? -1 : 1 };

  const [equipos, total] = await Promise.all([
    Equipo.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('fichaTecnica')
      .populate('clienteActual'),
    Equipo.countDocuments(query),
  ]);

  return {
    total,
    page,
    limit,
    equipos,
  };
};

module.exports = obtenerEquiposService;
