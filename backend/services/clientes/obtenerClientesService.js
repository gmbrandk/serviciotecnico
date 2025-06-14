const mongoose = require('mongoose');
const Cliente = require('@models/Cliente');

/**
 * ✅ Lógica base para obtener uno o varios clientes.
 * @param {Object} options - Configuración de búsqueda.
 * @param {String|null} options.id - ID del cliente (si aplica).
 * @param {Object} options.filtros - Filtros de búsqueda (estado, nombre, etc.).
 * @param {Object} options.opciones - Paginación y ordenamiento.
 */
const obtenerClientesService = async ({
  id = null,
  filtros = {},
  opciones = {},
}) => {
  if (id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw { status: 400, mensaje: 'ID inválido' };
    }

    const cliente = await Cliente.findById(id);
    if (!cliente) {
      throw { status: 404, mensaje: 'Cliente no encontrado' };
    }

    return cliente;
  }

  const { page = 1, limit = 20, sortBy = 'nombre', order = 'asc' } = opciones;

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: order === 'desc' ? -1 : 1 };

  const clientes = await Cliente.find(filtros)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await Cliente.countDocuments(filtros);

  return { clientes, total };
};

module.exports = obtenerClientesService;
