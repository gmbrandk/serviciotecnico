// controllers/ordenServicio/crearOrdenServicioController.js

const crearOrdenServicioService = require('@services/ordenServicio/crearOrdenServicioService');
const OrdenServicio = require('@models/OrdenServicio');
const { sendSuccess, sendError } = require('@utils/httpResponse');

const crearOrdenServicioController = async (req, res) => {
  try {
    const ordenCreada = await crearOrdenServicioService(req.body);

    const ordenPoblada = await OrdenServicio.findById(ordenCreada._id)
      .populate('cliente', 'nombre dni telefono')
      .populate('tecnico', 'nombre email')
      .populate('lineasServicio.tipoTrabajo', 'nombre descripcion precioBase') // puedes agregar `precioBase` si te interesa
      .populate('equipo', 'marca sku modelo nroSerie')
      .lean(); // más eficiente si solo vas a devolver el objeto

    return sendSuccess(res, 201, 'Orden de servicio creada correctamente', {
      orden: ordenPoblada,
    });
  } catch (err) {
    console.error('Error al crear orden de servicio:', err);
    return sendError(res, err);
  }
};

module.exports = crearOrdenServicioController;
