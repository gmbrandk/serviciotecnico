// 📁 helpers/equipos/inicializarHistorialClientes.js

const inicializarHistorialClientes = (clienteId) => {
  if (!clienteId) return [];

  return [
    {
      clienteId,
      fechaAsignacion: new Date(),
    },
  ];
};

module.exports = inicializarHistorialClientes;
