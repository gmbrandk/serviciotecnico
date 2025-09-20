const buscarClientesService = require('@services/clientes/buscarClientesService');
const { sendSuccess, sendError } = require('@utils/httpResponse');

module.exports = async (req, res) => {
  try {
    const result = await buscarClientesService({
      id: req.query.id || '', // ✅ agregar esto
      dni: req.query.dni || '',
      nombre: req.query.nombre || '',
      telefono: req.query.telefono || '',
      email: req.query.email || '',
      mode: req.query.mode || 'autocomplete',
      limit: req.query.limit,
    });

    return sendSuccess(res, {
      message: 'Clientes obtenidos correctamente',
      details: result,
    });
  } catch (error) {
    return sendError(res, {
      status: error.status || 500,
      message: error.message || 'Error al buscar clientes',
      details: error.details || null,
    });
  }
};
