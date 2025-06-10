const Cliente = require('@models/Cliente');

const editarClienteService = async (id, data) => {
  console.log('🟡 [Service] ID recibido:', id);
  console.log('🟡 [Service] Data recibida:', data);

  const { dni, email, telefono, estado, calificacion } = data;

  // 0. Obtener cliente original
  const clienteOriginal = await Cliente.findById(id);
  if (!clienteOriginal) {
    console.log('🔴 [Service] Cliente no encontrado');
    throw new Error('Cliente no encontrado');
  }

  // 1. Verificar que el DNI no cambie
  if ('dni' in data && data.dni !== clienteOriginal.dni) {
    console.log('🔴 [Service] Intento de cambiar el DNI original');
    throw new Error('No está permitido cambiar el DNI del cliente');
  }

  // 2. Validar estado y calificación
  if (estado && ['suspendido', 'baneado'].includes(estado)) {
    console.log('🔴 [Service] Estado inválido:', estado);
    throw new Error('No puedes asignar un estado inválido al cliente');
  }

  if (calificacion && ['malo', 'muy_malo'].includes(calificacion)) {
    console.log('🔴 [Service] Calificación inválida:', calificacion);
    throw new Error('No puedes asignar una calificación negativa al cliente');
  }

  // 3. Validar duplicados de email/teléfono
  const condiciones = [];
  if (email) condiciones.push({ email, _id: { $ne: id } });
  if (telefono) condiciones.push({ telefono, _id: { $ne: id } });

  for (const condicion of condiciones) {
    const duplicado = await Cliente.findOne(condicion);
    if (duplicado) {
      const campoDuplicado = Object.keys(condicion).find((c) => c !== '_id');
      console.log(`🔴 [Service] Duplicado encontrado para ${campoDuplicado}`);
      const nombresCampos = {
        email: 'correo',
        telefono: 'teléfono',
      };
      const campoLegible = nombresCampos[campoDuplicado] || campoDuplicado;
      throw new Error(`Ya existe un cliente con ese ${campoLegible}`);
    }
  }

  // 4. Eliminar DNI antes de actualizar (ya fue validado)
  delete data.dni;

  // 5. Actualizar
  console.log('🟡 [Service] Actualizando cliente...');
  const cliente = await Cliente.findByIdAndUpdate(id, data, { new: true });

  if (!cliente) {
    console.log('🔴 [Service] Cliente no encontrado al actualizar');
    throw new Error('Cliente no encontrado');
  }

  console.log('🟢 [Service] Cliente actualizado correctamente');
  return cliente;
};

module.exports = editarClienteService;
