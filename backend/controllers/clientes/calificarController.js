const calificarClienteService = require('@services/clientes/calificarClienteService');
const crearMovimiento = require('@controllers/movimiento/crearMovimientoController');
const TIPOS_MOVIMIENTO = require('@utils/constantes/tiposMovimiento');

const calificarClienteController = async (req, res) => {
  try {
    const clienteId = req.params.id;
    const { cliente, mensaje } = await calificarClienteService(clienteId);

    // 🔍 Registrar movimiento si hay un usuario autenticado
    if (req.usuario) {
      await crearMovimiento({
        tipo: TIPOS_MOVIMIENTO.EDITAR,
        descripcion: `Se recalificó manualmente al cliente ${cliente.nombre}`,
        entidad: 'cliente',
        entidadId: cliente._id,
        usuarioId: req.usuario._id,
      });
    }

    return res.status(200).json({
      success: true,
      mensaje,
      cliente,
    });
  } catch (error) {
    const status = error.message === 'Cliente no encontrado' ? 404 : 500;
    return res.status(status).json({
      success: false,
      mensaje: error.message,
    });
  }
};

module.exports = calificarClienteController;
