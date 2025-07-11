const editarEquipoService = require('@services/equipos/editarEquipoService');
const { sendSuccess, sendError } = require('@utils/httpResponse');

const editarEquipoController = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;

    // Inyectamos el usuario solicitante para control de permisos (rol)
    datosActualizados.usuarioSolicitante = req.usuario || null;

    const equipoActualizado = await editarEquipoService(id, datosActualizados);

    return sendSuccess(res, {
      message: 'Equipo editado correctamente',
      equipo: equipoActualizado,
    });
  } catch (error) {
    console.error('❌ Error en editarEquipoController:', error);
    return sendError(res, {
      status: error.status || 500,
      message: error.message || 'Error al editar equipo',
      details: error.details || null,
    });
  }
};

module.exports = editarEquipoController;
