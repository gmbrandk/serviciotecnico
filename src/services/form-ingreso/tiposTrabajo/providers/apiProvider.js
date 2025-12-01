// services/tiposTrabajo/providers/apiProvider.js
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/tipo-trabajo';

export const apiProvider = {
  /**
   * LISTAR TODOS
   */
  listarTiposTrabajo: async () => {
    try {
      console.info('[TiposTrabajoAPI] GET /tipo-trabajo');

      const res = await axios.get(BASE_URL);

      if (!res?.data?.success || !Array.isArray(res.data.details)) {
        console.warn('[TiposTrabajoAPI] ⚠ Respuesta inesperada:', res.data);
        return {
          success: false,
          status: res.status || 500,
          code: 'RESPUESTA_INVALIDA',
          message: 'Formato inesperado del servidor',
          details: { tiposTrabajo: [] },
        };
      }

      return {
        success: true,
        status: res.status,
        code: 'TIPOS_TRABAJO_LISTADOS',
        message: res.data.message || 'Tipos de trabajo obtenidos correctamente',
        details: { tiposTrabajo: res.data.details },
      };
    } catch (error) {
      console.error('[TiposTrabajoAPI] ❌ Error llamando a API', error);
      return {
        success: false,
        status: error?.response?.status || 500,
        code: 'ERROR_API',
        message: 'Error llamando al servidor',
        details: { tiposTrabajo: [] },
      };
    }
  },

  /**
   * BUSCAR POR ID
   */
  buscarTipoTrabajoPorId: async (id) => {
    try {
      console.info(`[TiposTrabajoAPI] GET /tipo-trabajo/${id}`);

      const res = await axios.get(`${BASE_URL}/${id}`);

      if (!res?.data?.success || !res.data?.details) {
        return {
          success: false,
          status: res.status || 404,
          code: 'TIPO_TRABAJO_NO_ENCONTRADO',
          message: 'El backend no devolvió un tipo de trabajo válido',
          details: null,
        };
      }

      return {
        success: true,
        status: res.status,
        code: 'TIPO_TRABAJO_ENCONTRADO',
        message: res.data.message || 'Tipo de trabajo encontrado',
        details: res.data.details, // ← un solo objeto
      };
    } catch (error) {
      console.error('[TiposTrabajoAPI] ❌ Error llamando a API', error);

      return {
        success: false,
        status: error?.response?.status || 500,
        code: 'ERROR_API',
        message:
          error?.response?.data?.message ||
          'Error consultando tipo de trabajo por ID',
        details: null,
      };
    }
  },
};
