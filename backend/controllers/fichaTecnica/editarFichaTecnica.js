const editarFichaTecnicaService = require('@services/fichaTecnica/editarFichaTecnicaService');
const { sendSuccess, sendError } = require('@utils/httpResponse');

const editarFichaTecnicaController = async (req, res) => {
  try {
    const { id } = req.params;
    const fichaEditada = await editarFichaTecnicaService(id, req.body);
    return sendSuccess(res, {
      message: 'Ficha Tecnica editada correctamente',
      ficha: fichaEditada,
    });
  } catch (error) {
    console.error('[❌ Error en editarFichaTecnicaController]:', error);
    return sendError(res, error);
  }
};

module.exports = editarFichaTecnicaController;
