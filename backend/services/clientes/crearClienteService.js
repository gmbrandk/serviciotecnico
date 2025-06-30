const Cliente = require('@models/Cliente');

const crearClienteService = async (data) => {
  // Valores seguros por defecto
  const clienteData = {
    ...data,
    estado: 'activo',
    calificacion: 'regular',
  };

  // Validación explícita (por si inyectan estado o calificación manualmente)
  if (data.estado && ['suspendido', 'baneado'].includes(data.estado)) {
    throw new Error(
      'No puedes crear un cliente con estado suspendido o baneado'
    );
  }

  if (
    data.calificacion &&
    ['malo', 'muy_malo', 'bueno', 'muy_bueno'].includes(data.calificacion)
  ) {
    throw new Error(
      'No puedes crear un cliente con calificación negativa o positiva'
    );
  }

  // Crear cliente
  const cliente = new Cliente(clienteData);
  return await cliente.save();
};

module.exports = crearClienteService;
