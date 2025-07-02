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
    const cliente = resultado.cliente;
    const metadata = resultado.metadata; // ✅ asegúrate de extraer esto

    const mensaje = resultado.yaEstaSuspendido
      ? 'El cliente ya se encuentra suspendido'
      : 'Cliente suspendido correctamente';

    if (!resultado.yaEstaSuspendido) {
      await crearMovimiento({
        tipo: TIPOS_MOVIMIENTO.EDITAR,
        descripcion: `Se suspendió al cliente ${cliente.nombre}`,
        entidad: 'cliente',
        entidadId: cliente._id,
        usuarioId: req.usuario._id,
        metadata: resultado.metadata, // 👈 asegúrate que sea un objeto real
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
        tipo: TIPOS_MOVIMIENTO.EDITAR,
        descripcion: `Se reactivó al cliente ${cliente.nombre}`,
        entidad: 'cliente',
        entidadId: cliente._id,
        usuarioId: req.usuario._id,
        metadata: resultado.metadata, // 👈 nuevo
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
        tipo: TIPOS_MOVIMIENTO.EDITAR,
        descripcion: `Se dio de baja definitivamente al cliente ${cliente.nombre}`,
        entidad: 'cliente',
        entidadId: cliente._id,
        usuarioId: req.usuario._id,
        metadata: resultado.metadata, // 👈 nuevo
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
