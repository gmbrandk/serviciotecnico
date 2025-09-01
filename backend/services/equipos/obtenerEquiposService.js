// 📂 services/equipos/obtenerEquiposService.js
const mongoose = require('mongoose');
const { Equipo } = require('@models/Equipo');

const obtenerEquiposService = async ({
  id = null,
  filtros = {},
  opciones = {},
}) => {
  // 🔹 Caso 1: obtener por ID
  if (id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw { status: 400, mensaje: 'ID de equipo inválido' };
    }
    const equipo = await Equipo.findById(id)
      .populate('fichaTecnica')
      .populate('clienteActual')
      .lean();

    if (!equipo) {
      throw { status: 404, mensaje: `Equipo con id ${id} no encontrado` };
    }
    return { equipo };
  }

  // 🔹 Caso 2: listado con filtros
  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    order = 'desc',
  } = opciones;
  const skip = (page - 1) * limit;
  const sort = { [sortBy]: order === 'desc' ? -1 : 1 };

  // ⚡ Normalización de filtros según schema
  const filtrosMongo = {};

  // Cliente actual
  if (filtros.clienteId && mongoose.Types.ObjectId.isValid(filtros.clienteId)) {
    filtrosMongo.clienteActual = new mongoose.Types.ObjectId(filtros.clienteId);
  }

  // Estado (ej: activo/inactivo/eliminado)
  if ('estado' in filtros) {
    if (filtros.estado === 'eliminado') filtrosMongo.activo = false;
    else filtrosMongo.estado = filtros.estado;
  }

  // Marca y tipo con búsqueda parcial
  if (filtros.marca) {
    filtrosMongo.marca = new RegExp(filtros.marca.trim(), 'i');
  }
  if (filtros.tipo) {
    filtrosMongo.tipo = new RegExp(filtros.tipo.trim(), 'i');
  }

  // Número de serie (match exacto, pero case-insensitive)
  if (filtros.nroSerie) {
    filtrosMongo.nroSerie = new RegExp(`^${filtros.nroSerie.trim()}$`, 'i');
  }

  // IMEI (match exacto, case-insensitive)
  if (filtros.imei) {
    filtrosMongo.imei = new RegExp(`^${filtros.imei.trim()}$`, 'i'); // 👈 agregar este bloque
  }

  if (filtros.macAddress) {
    filtrosMongo.macAddress = new RegExp(`^${filtros.macAddress.trim()}$`, 'i'); // 👈 agregar este bloque
  }

  // Texto libre: aplica a varios campos
  if (filtros.texto) {
    const regex = new RegExp(filtros.texto.trim(), 'i');
    filtrosMongo.$or = [
      { modelo: regex },
      { sku: regex },
      { nroSerie: regex },
      { imei: regex },
      { macAddress: regex },
    ];
  }

  const equipos = await Equipo.find(filtrosMongo)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('fichaTecnica')
    .populate('clienteActual')
    .lean();

  const total = await Equipo.countDocuments(filtrosMongo);

  return { equipos, total, page, limit };
};

module.exports = obtenerEquiposService;
