const Cliente = require('@models/Cliente');
const OrdenServicio = require('@models/OrdenServicio');
const validarYFormatearTelefono = require('@utils/telefonia/validarYFormatearTelefono');

const editarClienteService = async (id, data) => {
  console.log('🟡 [Service] ID recibido:', id);
  console.log('🟡 [Service] Data recibida:', data);

  const { dni, email, telefono } = data;

  // Campos sensibles que no deben modificarse desde esta ruta
  const camposProhibidos = ['estado', 'calificacion'];
  const camposNoPermitidos = camposProhibidos.filter((campo) =>
    data.hasOwnProperty(campo)
  );

  if (camposNoPermitidos.length > 0) {
    console.log(
      '🔴 [Service] Modificación no permitida de campos:',
      camposNoPermitidos
    );
    throw new Error(
      `No se permite modificar los siguientes campos desde esta ruta: ${camposNoPermitidos.join(
        ', '
      )}`
    );
  }

  // 0. Obtener cliente original
  const clienteOriginal = await Cliente.findById(id);
  if (!clienteOriginal) {
    console.log('🔴 [Service] Cliente no encontrado');
    throw new Error('Cliente no encontrado');
  }

  // 0.1 Validar si el cliente tiene órdenes no finalizadas
  const ordenesActivas = await OrdenServicio.findOne({
    cliente: id,
    estadoOS: { $ne: 'finalizado' },
  });

  if (ordenesActivas) {
    console.log('🔴 [Service] Cliente con orden de servicio en proceso');
    throw new Error(
      'No puedes editar un cliente con órdenes de servicio activas'
    );
  }

  // 1. Verificar que el DNI no cambie
  if ('dni' in data && data.dni !== clienteOriginal.dni) {
    console.log('🔴 [Service] Intento de cambiar el DNI original');
    throw new Error('No está permitido cambiar el DNI del cliente');
  }

  // 2. Validar y formatear teléfono
  if (telefono) {
    try {
      const { telefonoFormateado } = validarYFormatearTelefono(telefono);
      data.telefono = telefonoFormateado;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // 3. Validar duplicados de email o teléfono
  const condiciones = [];
  if (email) condiciones.push({ email, _id: { $ne: id } });
  if (data.telefono)
    condiciones.push({ telefono: data.telefono, _id: { $ne: id } });

  for (const condicion of condiciones) {
    const duplicado = await Cliente.findOne(condicion);
    if (duplicado) {
      const campoDuplicado = Object.keys(condicion).find((c) => c !== '_id');
      const nombresCampos = {
        email: 'correo',
        telefono: 'teléfono',
      };
      const campoLegible = nombresCampos[campoDuplicado] || campoDuplicado;
      console.log(`🔴 [Service] Duplicado encontrado para ${campoLegible}`);
      throw new Error(`Ya existe un cliente con ese ${campoLegible}`);
    }
  }

  // 4. Eliminar DNI antes de actualizar (ya fue validado)
  delete data.dni;

  // 5. Actualizar cliente
  console.log('🟡 [Service] Actualizando cliente...');
  const clienteActualizado = await Cliente.findByIdAndUpdate(id, data, {
    new: true,
  });

  if (!clienteActualizado) {
    console.log('🔴 [Service] Cliente no encontrado al actualizar');
    throw new Error('Cliente no encontrado');
  }

  console.log('🟢 [Service] Cliente actualizado correctamente');
  return clienteActualizado;
};

module.exports = editarClienteService;
