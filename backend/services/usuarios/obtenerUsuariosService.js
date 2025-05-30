const Usuario = require('@models/Usuario');

const obtenerUsuariosService = async (filtros = {}) => {
  const query = {};

  // 🎯 Filtro por rol
  if (filtros.role) {
    query.role = filtros.role.toLowerCase();
  }

  // 🎯 Filtro por estado (activo)
  if (filtros.activo !== undefined) {
    query.activo = filtros.activo === 'true';
  }

  // 🎯 Filtro por nombre (búsqueda parcial, insensible a mayúsculas)
  if (filtros.nombre) {
    query.nombre = { $regex: filtros.nombre, $options: 'i' };
  }

  return await Usuario.find(query).select('-password');
};

module.exports = obtenerUsuariosService;
