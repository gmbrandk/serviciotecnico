// services/tiposTrabajo/tiposTrabajo.service.js
const TipoDeTrabajo = require('@models/TipodeTrabajo');

class TiposTrabajoService {
  async listar() {
    const tipos = await TipoDeTrabajo.find({ activo: true }).lean();

    return {
      success: true,
      code: 'TIPOS_TRABAJO_LISTADOS',
      message: 'Tipos de trabajo obtenidos correctamente',
      details: tipos,
    };
  }

  async buscarPorId(id) {
    try {
      const tipo = await TipoDeTrabajo.findById(id).lean();

      if (!tipo) {
        return {
          success: false,
          code: 'TIPO_TRABAJO_NO_ENCONTRADO',
          message: 'No existe un tipo de trabajo con ese ID',
          details: null,
        };
      }

      return {
        success: true,
        code: 'TIPO_TRABAJO_ENCONTRADO',
        message: 'Tipo de trabajo encontrado correctamente',
        details: tipo,
      };
    } catch (err) {
      return {
        success: false,
        code: 'ERROR_BUSCAR_TIPO_TRABAJO',
        message: 'ID inválido o error en base de datos',
        details: null,
      };
    }
  }
}

module.exports = new TiposTrabajoService();
