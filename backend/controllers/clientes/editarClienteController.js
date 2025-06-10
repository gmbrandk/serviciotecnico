const xss = require('xss');
const mongoose = require('mongoose');
const editarClienteService = require('@services/clientes/editarClienteService');
const { sendSuccess, sendError } = require('@utils/httpResponse');

const editarClienteController = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🟢 [Controller] ID recibido:', id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('🔴 [Controller] ID inválido');
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
    console.log('🟢 [Controller] Campos recibidos:', camposRecibidos);

    const camposInvalidos = camposRecibidos.filter(
      (campo) => !camposPermitidos.includes(campo)
    );
    if (camposInvalidos.length > 0) {
      console.log('🔴 [Controller] Campos no permitidos:', camposInvalidos);
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
          console.log('🔴 [Controller] Campo peligroso:', campo);
          return sendError(
            res,
            400,
            `El campo ${campo} contiene caracteres no permitidos`
          );
        }
        bodySanitizado[campo] = xss(valor);
      }
    }
    console.log('🟢 [Controller] Body sanitizado:', bodySanitizado);

    if (bodySanitizado.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(bodySanitizado.email)) {
        console.log('🔴 [Controller] Email con formato inválido');
        return sendError(res, 400, 'El correo tiene un formato inválido');
      }
    }

    console.log('🟡 [Controller] Llamando al service...');
    const cliente = await editarClienteService(id, bodySanitizado);
    console.log('🟢 [Controller] Cliente actualizado:', cliente);

    return sendSuccess(res, 200, 'Cliente editado correctamente', { cliente });
  } catch (error) {
    console.error('💥 [Controller] Error al editar cliente:', error.message);
    const status = error.message === 'Cliente no encontrado' ? 404 : 400;
    return sendError(res, status, error.message);
  }
};

module.exports = editarClienteController;
