const mongoose = require('mongoose');
const Usuario = require('@models/Usuario');

const obtenerUsuariosService = async (filtros = {}) => {
  const query = {};

  const definicionesFiltros = [
    {
      clave: '_id',
      aplicar: (val) => {
        if (!mongoose.Types.ObjectId.isValid(val)) {
          const error = new Error('El ID proporcionado no es válido.');
          error.statusCode = 400;
          throw error;
        }
        return val;
      },
    },
    {
      clave: 'role',
      aplicar: (val) => val.toLowerCase(),
    },
    {
      clave: 'activo',
      aplicar: (val) => val === 'true',
    },
    {
      clave: 'nombre',
      aplicar: (val) => ({ $regex: val, $options: 'i' }),
    },
  ];

  definicionesFiltros.forEach(({ clave, aplicar }) => {
    if (filtros[clave] !== undefined) {
      const valor = aplicar(filtros[clave]);
      query[clave] = valor;
    }
  });

  return await Usuario.find(query).select('-password');
};

module.exports = obtenerUsuariosService;
