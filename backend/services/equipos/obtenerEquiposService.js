// 📁 services/equipos/obtenerEquiposService.js

const Equipo = require('@models/Equipo');
const { isValidObjectId } = require('mongoose');

const obtenerEquiposService = async ({
  clienteId,
  estado,
  texto,
  limite = 20,
  pagina = 1,
  sort = '-createdAt',
}) => {
  const filtro = {};

  if (clienteId && isValidObjectId(clienteId)) {
    filtro.clienteActual = clienteId;
  }

  if (estado) {
    if (estado === 'eliminado') filtro.activo = false;
    else filtro.estado = estado; // activo, obsoleto, suspendido...
  }

  if (texto && texto.trim()) {
    const regex = new RegExp(texto.trim(), 'i');
    filtro.$or = [{ modelo: regex }, { sku: regex }, { nroSerie: regex }];
  }

  const skip = (pagina - 1) * limite;

  const [total, equipos] = await Promise.all([
    Equipo.countDocuments(filtro),
    Equipo.find(filtro)
      .sort(sort)
      .skip(skip)
      .limit(limite)
      .populate('fichaTecnica')
      .populate('clienteActual'),
  ]);

  return {
    total,
    pagina,
    limite,
    equipos,
  };
};

module.exports = obtenerEquiposService;
