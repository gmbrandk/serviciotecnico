const mongoose = require('mongoose');
const {
  suspenderCliente,
  reactivarCliente,
  confirmarBajaCliente,
} = require('@services/clientes/estadoClienteService');
const { sendSuccess, sendError } = require('@utils/httpResponse');
const crearMovimiento = require('@controllers/movimiento/crearMovimientoController');

const validarId = (id) => mongoose.Types.ObjectId.isValid(id);

const suspender = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validarId(id)) return sendError(res, 400, 'ID inválido');

    const resultado = await suspenderCliente(id);
    const cliente = resultado.cliente;

    const mensaje = resultado.yaEstaSuspendido
      ? 'El cliente ya se encuentra suspendido'
      : 'Cliente suspendido correctamente';

    if (!resultado.yaEstaSuspendido) {
      await crearMovimiento({
        tipo: 'modificacion',
        descripcion: `Se suspendió al cliente ${cliente.nombre}`,
        entidad: 'cliente',
        entidadId: cliente._id,
        usuarioId: req.usuario._id,
        usadoPor: req.usuario.nombre,
      });
    }

    return sendSuccess(res, 200, mensaje, { cliente });
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

const reactivar = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validarId(id)) return sendError(res, 400, 'ID inválido');

    const resultado = await reactivarCliente(id);
    const cliente = resultado.cliente;

    const mensaje = resultado.yaEstaActivo
      ? 'El cliente ya está activo'
      : 'Cliente reactivado correctamente';

    if (!resultado.yaEstaActivo) {
      await crearMovimiento({
        tipo: 'modificacion',
        descripcion: `Se reactivó al cliente ${cliente.nombre}`,
        entidad: 'cliente',
        entidadId: cliente._id,
        usuarioId: req.usuario._id,
        usadoPor: req.usuario.nombre,
      });
    }

    return sendSuccess(res, 200, mensaje, { cliente });
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

const confirmarBaja = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validarId(id)) return sendError(res, 400, 'ID inválido');

    const resultado = await confirmarBajaCliente(id);
    const cliente = resultado.cliente;

    const mensaje = resultado.yaEstaBaneado
      ? 'El cliente ya fue dado de baja permanentemente'
      : 'Baja definitiva confirmada correctamente';

    if (!resultado.yaEstaBaneado) {
      await crearMovimiento({
        tipo: 'modificacion',
        descripcion: `Se dio de baja definitivamente al cliente ${cliente.nombre}`,
        entidad: 'cliente',
        entidadId: cliente._id,
        usuarioId: req.usuario._id,
        usadoPor: req.usuario.nombre,
      });
    }

    return sendSuccess(res, 200, mensaje, { cliente });
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

module.exports = {
  suspender,
  reactivar,
  confirmarBaja,
};
