const xss = require('xss');
const mongoose = require('mongoose');
const editarClienteService = require('@services/clientes/editarClienteService');
const { sendSuccess, sendError } = require('@utils/httpResponse');

const editarClienteController = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validar ID de MongoDB
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'ID inválido');
    }

    const camposPermitidos = [
      'nombre',
      'dni',
      'telefono',
      'email',
      'observaciones',
      'estado',
      'calificacion',
    ];

    const camposRecibidos = Object.keys(req.body);

    // 2. Rechazar campos no permitidos
    const camposInvalidos = camposRecibidos.filter(
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

    // 3. Sanitizar inputs
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

    // 4. Validar formato email si existe
    if (bodySanitizado.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(bodySanitizado.email)) {
        return sendError(res, 400, 'El correo tiene un formato inválido');
      }
    }

    // 5. Llamar al service
    const cliente = await editarClienteService(id, bodySanitizado);

    return sendSuccess(res, 200, 'Cliente editado correctamente', { cliente });
  } catch (error) {
    const status = error.message === 'Cliente no encontrado' ? 404 : 400;
    return sendError(res, status, error.message);
  }
};

module.exports = editarClienteController;
