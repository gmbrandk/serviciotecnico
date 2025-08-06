const OrdenServicio = require('@models/OrdenServicio');
const { ValidationError } = require('@utils/errors');
const mongoose = require('mongoose');

const actualizarOrdenServicioService = async (id, data) => {
  const orden = await OrdenServicio.findById(id);
  if (!orden) throw new ValidationError('Orden de servicio no encontrada');

  // Validaciones si deseas actualizar lineasServicio
  if (data.lineasServicio) {
    if (
      !Array.isArray(data.lineasServicio) ||
      data.lineasServicio.length === 0
    ) {
      throw new ValidationError('Se requiere al menos una línea de servicio.');
    }

    data.lineasServicio = data.lineasServicio.map((linea, index) => {
      if (!mongoose.Types.ObjectId.isValid(linea.tipoTrabajo)) {
        throw new ValidationError(
          `Tipo de trabajo inválido en línea ${index + 1}`
        );
      }

      return {
        ...linea,
        tipoTrabajo: new mongoose.Types.ObjectId(linea.tipoTrabajo),
      };
    });

    // Calculamos el nuevo total
    data.total = data.lineasServicio.reduce(
      (sum, linea) => sum + linea.precioUnitario * linea.cantidad,
      0
    );
  }

  Object.assign(orden, data);
  await orden.save();

  await orden.populate([
    { path: 'cliente' },
    { path: 'representante' },
    { path: 'equipo' },
    { path: 'lineasServicio.tipoTrabajo' },
  ]);

  return orden;
};

module.exports = actualizarOrdenServicioService;
