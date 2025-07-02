const mongoose = require('mongoose');
const {
  suspenderCliente,
  reactivarCliente,
  confirmarBajaCliente,
} = require('@services/clientes/estadoClienteService');
const { sendSuccess, sendError } = require('@utils/httpResponse');
const crearMovimiento = require('@controllers/movimiento/crearMovimientoController');
const TIPOS_MOVIMIENTO = require('@utils/constantes/tiposMovimiento');

const validarId = (id) => mongoose.Types.ObjectId.isValid(id);

const suspender = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validarId(id)) return sendError(res, 400, 'ID inválido');

    const resultado = await suspenderCliente(id);
    const { cliente, metadata, yaEstaSuspendido } = resultado;

    const mensaje = yaEstaSuspendido
      ? 'El cliente ya se encuentra suspendido'
      : 'Cliente suspendido correctamente';

    if (!yaEstaSuspendido) {
      await crearMovimiento({
        tipo: TIPOS_MOVIMIENTO.EDITAR,
        descripcion: `Se suspendió al cliente ${cliente.nombre}`,
        entidad: 'cliente',
        entidadId: cliente._id,
        usuarioId: req.usuario._id,
        metadata,
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
    const { cliente, metadata, yaEstaActivo } = resultado;

    const mensaje = yaEstaActivo
      ? 'El cliente ya está activo'
      : 'Cliente reactivado correctamente';

    if (!yaEstaActivo) {
      await crearMovimiento({
        tipo: TIPOS_MOVIMIENTO.EDITAR,
        descripcion: `Se reactivó al cliente ${cliente.nombre}`,
        entidad: 'cliente',
        entidadId: cliente._id,
        usuarioId: req.usuario._id,
        metadata,
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
    const { motivo } = req.body;

    if (!validarId(id)) return sendError(res, 400, 'ID inválido');

    const motivoLimpio = motivo?.trim();
    if (!motivoLimpio || motivoLimpio.length < 10) {
      return sendError(
        res,
        400,
        'Debes ingresar un motivo válido (mínimo 10 caracteres)'
      );
    }

    const resultado = await confirmarBajaCliente(id);
    const { cliente, yaEstaBaneado } = resultado;

    const mensaje = yaEstaBaneado
      ? 'El cliente ya fue dado de baja permanentemente'
      : 'Baja definitiva confirmada correctamente';

    if (!yaEstaBaneado) {
      await crearMovimiento({
        tipo: TIPOS_MOVIMIENTO.EDITAR,
        descripcion: `Se dio de baja definitivamente al cliente ${cliente.nombre}`,
        entidad: 'cliente',
        entidadId: cliente._id,
        usuarioId: req.usuario._id,
        metadata: {
          motivo: motivoLimpio,
        },
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
