const calificarClienteService = require('../../services/clientes/calificarClienteService');

/**
 * 🎯 Controlador: solo gestiona la solicitud y respuesta HTTP.
 */
const calificarClienteController = async (req, res) => {
  try {
    const clienteId = req.params.id;
    const { cliente, mensaje } = await calificarClienteService(clienteId);

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
