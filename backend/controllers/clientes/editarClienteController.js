const xss = require('xss');
const mongoose = require('mongoose');
const editarClienteService = require('@services/clientes/editarClienteService');
const { sendSuccess, sendError } = require('@utils/httpResponse');
const crearMovimiento = require('@controllers/movimiento/crearMovimientoController');
const TIPOS_MOVIMIENTO = require('@utils/constantes/tiposMovimiento');

const editarClienteController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'ID inválido');
    }

    // Solo campos seguros permitidos en esta ruta
    const camposPermitidos = [
      'nombre',
      'dni',
      'telefono',
      'email',
      'direccion',
      'observaciones',
    ];

    const camposInvalidos = Object.keys(req.body).filter(
      (campo) => !camposPermitidos.includes(campo)
    );

    if (camposInvalidos.length > 0) {
      return sendError(
        res,
        400,
        `Los siguientes campos no están permitidos en esta ruta: ${camposInvalidos.join(
          ', '
        )}`
      );
    }

    // Sanitización
    const bodySanitizado = {};
    for (const campo of camposPermitidos) {
      if (req.body[campo]) {
        const valor = req.body[campo];
        if (typeof valor === 'string' && /<|>/.test(valor)) {
          return sendError(
            res,
            400,
            `El campo ${campo} contiene caracteres no permitidos`
          );
        }
        bodySanitizado[campo] = xss(valor);
      }
    }

    // Validación de email
    if (bodySanitizado.email) {
      const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

      if (bodySanitizado.email.includes('..')) {
        return sendError(
          res,
          400,
          'El correo tiene un formato inválido (doble punto)'
        );
      }

      if (!emailRegex.test(bodySanitizado.email)) {
        return sendError(res, 400, 'El correo tiene un formato inválido');
      }
    }

    // Obtener cliente original para comparar
    const clienteAntes = await require('@models/Cliente').findById(id).lean();

    // Llamar al servicio
    const cliente = await editarClienteService(id, bodySanitizado);

    // Registrar cambios realizados
    const cambios = [];
    for (const campo of Object.keys(bodySanitizado)) {
      const anterior = clienteAntes?.[campo];
      const nuevo = cliente?.[campo];
      if (anterior !== undefined && anterior !== nuevo) {
        cambios.push(`${campo}: '${anterior}' → '${nuevo}'`);
      }
    }

    const descripcionMovimiento =
      cambios.length > 0
        ? `Se editaron los campos: ${cambios.join(', ')}`
        : `Se editó al cliente ${cliente.nombre}`;

    // Registrar movimiento
    await crearMovimiento({
      tipo: TIPOS_MOVIMIENTO.EDITAR,
      descripcion: descripcionMovimiento,
      entidad: 'cliente',
      entidadId: cliente._id,
      usuarioId: req.usuario._id,
    });

    return sendSuccess(res, 200, 'Cliente editado correctamente', { cliente });
  } catch (error) {
    console.error('💥 [editarClienteController]', error.message);
    const status = error.message === 'Cliente no encontrado' ? 404 : 400;
    return sendError(res, status, error.message);
  }
};

module.exports = editarClienteController;
