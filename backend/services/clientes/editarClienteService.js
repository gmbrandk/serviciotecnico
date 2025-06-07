const Cliente = require('@models/Cliente');

const editarClienteService = async (id, data) => {
  const cliente = await Cliente.findByIdAndUpdate(id, data, { new: true });
  if (!cliente) throw new Error('Cliente no encontrado');
  return cliente;
};

module.exports = editarClienteService;
