// helpers/equipos/inicializarHistorialClientes.js
const inicializarHistorialClientes = (clienteId, { usuarioId = null } = {}) => {
  const now = new Date();

  return [
    {
      clienteId,
      fechaAsignacion: now,
      fechaFin: null,
      origenCambio: 'auto', // 🔹 indica que es por creación de equipo
      usuarioResponsable: usuarioId, // 🔹 quién lo creó (opcional)
    },
  ];
};

module.exports = inicializarHistorialClientes;
