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

    const camposPermitidos = [
      'nombre',
      'dni',
      'telefono',
      'email',
      'direccion',
      'estado',
      'calificacion',
    ];

    const camposInvalidos = Object.keys(req.body).filter(
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

    if (bodySanitizado.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(bodySanitizado.email)) {
        return sendError(res, 400, 'El correo tiene un formato inválido');
      }
    }

    const cliente = await editarClienteService(id, bodySanitizado);

    // 🧾 Registrar movimiento
    await crearMovimiento({
      tipo: TIPOS_MOVIMIENTO.EDITAR,
      descripcion: `Se editó al cliente ${cliente.nombre}`,
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
