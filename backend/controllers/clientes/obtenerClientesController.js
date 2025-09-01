const obtenerClientesService = require('@services/clientes/obtenerClientesService');
const { sendSuccess, sendError } = require('@utils/httpResponse');

const obtenerClientesController = async (req, res) => {
  try {
    // Lista blanca de filtros permitidos
    const allowedFilters = [
      'estado',
      'nombres',
      'dni',
      'apellidos',
      'telefono',
      'calificacion',
      'isActivo',
      'page',
      'limit',
      'sortBy',
      'order',
    ];

    // Validamos que no vengan filtros extraños
    const queryKeys = Object.keys(req.query);
    const invalidFilters = queryKeys.filter(
      (key) => !allowedFilters.includes(key)
    );

    if (invalidFilters.length > 0) {
      return sendError(res, {
        status: 400,
        message: `Parámetros no permitidos: ${invalidFilters.join(', ')}`,
      });
    }

    // Extraemos los filtros permitidos
    const {
      estado,
      nombres,
      dni,
      apellidos,
      telefono,
      calificacion,
      isActivo,
      page,
      limit,
      sortBy,
      order,
    } = req.query;

    const filtros = {};
    if (estado) filtros.estado = estado;
    if (calificacion) filtros.calificacion = calificacion;
    if (isActivo !== undefined) filtros.isActivo = isActivo;
    if (nombres) filtros.nombres = nombres;
    if (apellidos) filtros.apellidos = apellidos;
    if (dni) filtros.dni = dni;
    if (telefono) filtros.telefono = telefono;

    const opciones = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      sortBy: sortBy || 'nombres',
      order: order ? order.toLowerCase() : 'asc',
    };

    const { clientes, total } = await obtenerClientesService({
      filtros,
      opciones,
    });

    const details = { clientes, total };
    if (!clientes || clientes.length === 0) {
      details.warnings = [
        {
          code: 'NO_RESULTS',
          message:
            'No se encontraron clientes que coincidan con los filtros proporcionados.',
        },
      ];
    }

    return sendSuccess(res, {
      status: 200,
      message: 'Clientes obtenidos',
      details,
    });
  } catch (error) {
    return sendError(res, {
      status: error.status || 500,
      message: error.mensaje || 'Error al obtener clientes',
      details: error.details || null,
    });
  }
};

module.exports = obtenerClientesController;
