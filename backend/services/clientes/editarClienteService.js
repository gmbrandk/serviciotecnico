const Cliente = require('@models/Cliente');

const editarClienteService = async (id, data) => {
  const { dni, email, telefono, estado, calificacion } = data;

  // 1. Validaciones de estado y calificación
  if (estado && ['suspendido', 'baneado'].includes(estado)) {
    throw new Error('No puedes editar a un cliente con estado inválido');
  }

  if (calificacion && ['malo', 'muy_malo'].includes(calificacion)) {
    throw new Error('No puedes asignar una calificación negativa al cliente');
  }

  // 2. Validar duplicados si cambian campos únicos
  const condiciones = [];

  if (dni) {
    condiciones.push({
      dni,
      _id: { $ne: id }, // evitar compararse consigo mismo
    });
  }

  if (email) {
    condiciones.push({
      email,
      _id: { $ne: id },
    });
  }

  if (telefono) {
    condiciones.push({
      telefono,
      _id: { $ne: id },
    });
  }

  for (const condicion of condiciones) {
    const duplicado = await Cliente.findOne(condicion);
    if (duplicado) {
      const campoDuplicado = Object.keys(condicion).find((c) => c !== '_id');
      throw new Error(`Ya existe un cliente con ese ${campoDuplicado}`);
    }
  }

  // 3. Actualizar cliente
  const cliente = await Cliente.findByIdAndUpdate(id, data, { new: true });

  if (!cliente) throw new Error('Cliente no encontrado');

  return cliente;
};

module.exports = editarClienteService;
