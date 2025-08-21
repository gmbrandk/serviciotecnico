const xss = require('xss');
const crearClienteService = require('@services/clientes/crearClienteService');
const { sendSuccess, sendError } = require('@utils/httpResponse');
const crearMovimiento = require('@controllers/movimiento/crearMovimientoController');
const TIPOS_MOVIMIENTO = require('@utils/constantes/tiposMovimiento');

const crearClienteController = async (req, res) => {
  try {
    const camposPermitidos = [
      'nombre',
      'dni',
      'telefono',
      'direccion',
      'email',
    ];
    const bodyRecibido = req.body;
    const bodySanitizado = {};

    // ❌ Rechazar campos no permitidos
    const camposInvalidos = Object.keys(bodyRecibido).filter(
      (campo) => !camposPermitidos.includes(campo)
    );
    if (camposInvalidos.length > 0) {
      return sendError(
        res,
        400,
        `Los siguientes campos no están permitidos: ${camposInvalidos.join(
          ', '
        )}`
      );
    }

    // ✨ Sanitizar XSS
    for (const campo of camposPermitidos) {
      const valor = bodyRecibido[campo];
      if (valor) bodySanitizado[campo] = xss(valor);
    }

    // 🛠 Crear cliente mediante service
    const cliente = await crearClienteService(bodySanitizado);

    // 📒 Crear movimiento de auditoría
    await crearMovimiento({
      tipo: TIPOS_MOVIMIENTO.CREAR,
      descripcion: `Se registró al cliente ${cliente.nombre}`,
      entidad: 'cliente',
      entidadId: cliente._id,
      usuarioId: req.usuario._id,
    });

    return sendSuccess(res, 201, 'Cliente creado correctamente', { cliente });
  } catch (error) {
    console.error('[crearClienteController]', error);
    return sendError(
      res,
      error.status || 500,
      error.message || 'Error al crear el cliente'
    );
  }
};

module.exports = crearClienteController;
