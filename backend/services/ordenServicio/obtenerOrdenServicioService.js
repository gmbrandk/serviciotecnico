const OrdenServicio = require('@models/OrdenServicio');

const obtenerOrdenServicioService = async ({
  id = null,
  filtro = {},
  paginacion = {},
}) => {
  if (id) {
    const orden = await OrdenServicio.findById(id)
      .populate('cliente')
      .populate('representante')
      .populate('equipo')
      .populate('lineasServicio.tipoTrabajo');

    if (!orden) throw new Error('Orden de servicio no encontrada');
    return orden;
  }

  const { limit = 20, skip = 0 } = paginacion;

  const ordenes = await OrdenServicio.find(filtro)
    .populate('cliente')
    .populate('representante')
    .populate('equipo')
    .populate('lineasServicio.tipoTrabajo')
    .limit(limit)
    .skip(skip)
    .sort({ fechaIngreso: -1 });

  return ordenes;
};

module.exports = obtenerOrdenServicioService;
