// controllers/ordenServicio/crearOrdenServicioController.js
const crearOrdenServicioService = require('@services/ordenServicio/crearOrdenServicioService');
const OrdenServicio = require('@models/OrdenServicio');
const { sendSuccess, sendError } = require('@utils/httpResponse');

const crearOrdenServicioController = async (req, res) => {
  try {
    const ordenCreada = await crearOrdenServicioService(req.body);

    const ordenPoblada = await OrdenServicio.findById(ordenCreada._id)
      .populate('cliente', 'nombres apellidos dni telefono email')
      .populate('representante', 'nombres apellidos dni telefono email')
      .populate('tecnico', 'nombre email')
      .populate('lineasServicio.tipoTrabajo', 'nombre descripcion precioBase')
      .populate('equipo', 'marca sku modelo nroSerie')
      .lean();

    return sendSuccess(res, {
      status: 201,
      message: `Orden de servicio ${ordenPoblada.codigo} creada correctamente`,
      details: { orden: ordenPoblada },
    });
  } catch (err) {
    console.error('Error al crear orden de servicio:', err);
    return sendError(res, err);
  }
};

module.exports = crearOrdenServicioController;
