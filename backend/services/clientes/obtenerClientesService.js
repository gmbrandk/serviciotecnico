const Cliente = require('@models/Cliente');

const obtenerClientesService = async (filtros = {}) => {
  const query = {};

  if (filtros.nombre) {
    query.nombre = { $regex: filtros.nombre, $options: 'i' };
  }

  if (filtros.estado) {
    query.estado = filtros.estado;
  }

  if (filtros.calificacion) {
    query.calificacion = filtros.calificacion;
  }

  return await Cliente.find(query);
};

module.exports = obtenerClientesService;
