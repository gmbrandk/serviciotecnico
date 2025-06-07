const Cliente = require('@models/Cliente');

const obtenerClientePorIdService = async (id) => {
  const cliente = await Cliente.findById(id);
  if (!cliente) throw new Error('Cliente no encontrado');
  return cliente;
};

module.exports = obtenerClientePorIdService;
