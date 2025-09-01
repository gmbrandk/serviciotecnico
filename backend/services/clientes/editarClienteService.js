const Cliente = require('@models/Cliente');
const OrdenServicio = require('@models/OrdenServicio');
const validarYFormatearTelefono = require('@utils/telefonia/validarYFormatearTelefono');
const {
  ValidationError,
  DuplicateError,
  NotFoundError,
} = require('@utils/errors');

const editarClienteService = async (id, data) => {
  console.log('🟡 [Service] ID recibido:', id);
  console.log('🟡 [Service] Data recibida:', data);

  const { dni, email, telefono } = data;

  // 🔹 Campos que no se pueden modificar desde aquí
  const camposProhibidos = ['estado', 'calificacion'];
  const camposNoPermitidos = camposProhibidos.filter((campo) =>
    data.hasOwnProperty(campo)
  );

  if (camposNoPermitidos.length > 0) {
    throw new ValidationError({
      code: 'FORBIDDEN_FIELDS',
      message: `No se permite modificar los siguientes campos desde esta ruta: ${camposNoPermitidos.join(
        ', '
      )}`,
      details: { camposNoPermitidos },
    });
  }

  // 🔹 Obtener cliente original
  const clienteOriginal = await Cliente.findById(id);
  if (!clienteOriginal) {
    throw new NotFoundError(`Cliente con id ${id} no encontrado`, { id });
  }

  // 🔹 Validar si el cliente tiene órdenes activas
  const ordenesActivas = await OrdenServicio.findOne({
    cliente: id,
    estadoOS: { $ne: 'finalizado' },
  });

  if (ordenesActivas) {
    throw new ValidationError({
      code: 'CLIENT_WITH_ACTIVE_OS',
      message: 'No puedes editar un cliente con órdenes de servicio activas',
      details: { clienteId: id },
    });
  }

  // 🔹 Verificar que el DNI no cambie
  if ('dni' in data && data.dni !== clienteOriginal.dni) {
    throw new ValidationError({
      code: 'IMMUTABLE_FIELD',
      message: 'No está permitido cambiar el DNI del cliente',
      details: { field: 'dni' },
    });
  }

  // 🔹 Validar y formatear teléfono
  if (telefono) {
    try {
      const { telefonoFormateado } = validarYFormatearTelefono(telefono);
      data.telefono = telefonoFormateado;
    } catch (error) {
      throw new ValidationError({
        code: 'INVALID_PHONE',
        message: error.message,
        details: { input: telefono },
      });
    }
  }

  // 🔹 Validar duplicados en email o teléfono
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
      throw new DuplicateError(`Ya existe un cliente con ese ${campoLegible}`, {
        field: campoDuplicado,
        value: data[campoDuplicado],
      });
    }
  }

  // 🔹 Eliminar DNI antes de actualizar (ya fue validado)
  delete data.dni;

  // 🔹 Actualizar cliente con validaciones de esquema
  const clienteActualizado = await Cliente.findOneAndUpdate({ _id: id }, data, {
    new: true,
    runValidators: true,
  });

  if (!clienteActualizado) {
    throw new NotFoundError(
      `Cliente con id ${id} no encontrado al actualizar`,
      { id }
    );
  }

  console.log('🟢 [Service] Cliente actualizado correctamente');
  return clienteActualizado;
};

module.exports = editarClienteService;
