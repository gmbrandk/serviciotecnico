// controllers/estadoClienteController.js
const mongoose = require('mongoose');
const {
  suspenderCliente,
  reactivarCliente,
  confirmarBajaCliente,
} = require('@services/clientes/estadoClienteService');
const { sendSuccess, sendError } = require('@utils/httpResponse');

const validarId = (id) => mongoose.Types.ObjectId.isValid(id);

const suspender = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validarId(id)) return sendError(res, 400, 'ID inválido');

    const resultado = await suspenderCliente(id);
    const mensaje = resultado.yaEstaSuspendido
      ? 'El cliente ya se encuentra suspendido'
      : 'Cliente suspendido correctamente';

    return sendSuccess(res, 200, mensaje, { cliente: resultado.cliente });
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

const reactivar = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validarId(id)) return sendError(res, 400, 'ID inválido');

    const resultado = await reactivarCliente(id);
    const mensaje = resultado.yaEstaActivo
      ? 'El cliente ya está activo'
      : 'Cliente reactivado correctamente';

    return sendSuccess(res, 200, mensaje, { cliente: resultado.cliente });
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

const confirmarBaja = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validarId(id)) return sendError(res, 400, 'ID inválido');

    const resultado = await confirmarBajaCliente(id);
    const mensaje = resultado.yaEstaBaneado
      ? 'El cliente ya fue dado de baja permanentemente'
      : 'Baja definitiva confirmada correctamente';

    return sendSuccess(res, 200, mensaje, { cliente: resultado.cliente });
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

module.exports = {
  suspender,
  reactivar,
  confirmarBaja,
};
