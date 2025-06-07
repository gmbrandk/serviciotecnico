const Cliente = require('@models/Cliente');

const crearClienteService = async (data) => {
  const { estado, calificacion } = data;

  // Validar estado al crear
  if (estado && ['suspendido', 'baneado'].includes(estado)) {
    throw new Error(
      'No puedes crear un cliente con estado suspendido o baneado'
    );
  }

  // Validar calificación al crear
  if (calificacion && ['malo', 'muy_malo'].includes(calificacion)) {
    throw new Error(
      'No puedes crear un cliente con calificación mala o muy mala'
    );
  }

  // Crear cliente
  const cliente = new Cliente(data);
  return await cliente.save();
};

module.exports = crearClienteService;
