const mongoose = require('mongoose');
const {
  suspenderCliente,
  reactivarCliente,
  confirmarBajaCliente,
} = require('@services/clientes/estadoClienteService');
const { sendSuccess, sendError } = require('@utils/httpResponse');

const validarId = (id) => mongoose.Types.ObjectId.isValid(id);

const estadoClienteController = {
  async suspender(req, res) {
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
  },

  async reactivar(req, res) {
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
  },

  async confirmarBaja(req, res) {
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
  },
};

module.exports = estadoClienteController;
