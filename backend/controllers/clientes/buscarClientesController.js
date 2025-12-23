const buscarClientesService = require('@services/clientes/buscarClientesService');
const { sendSuccess, sendError } = require('@utils/httpResponse');

module.exports = async (req, res) => {
  try {
    const { query = '', dni, nombre, telefono, email, id, mode } = req.query;

    const params = {
      id: id || '',
      dni: dni || '',
      nombre: nombre || '',
      telefono: telefono || '',
      email: email || '',
      mode: mode || 'autocomplete',
    };

    // 🔹 Resolver query genérico
    if (query && !dni && !nombre && !telefono && !email) {
      if (/^\d+$/.test(query)) {
        // Solo números → DNI o teléfono
        params.dni = query;
      } else if (/^\S+@\S+\.\S+$/.test(query)) {
        // Email
        params.email = query;
      } else {
        // Texto → nombre
        params.nombre = query;
      }
    }

    const result = await buscarClientesService(params);

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
