import { errorResponse, successResponse } from '@utils/responseFormatter';
import axios from 'axios';

const baseURL = 'http://localhost:5000/api';

export const apiProvider = {
  crearOrdenServicio: async (ordenData) => {
    try {
      const res = await axios.post(`${baseURL}/os`, ordenData, {
        withCredentials: true,
      });

      return successResponse({
        status: res.status,
        code: 'ORDEN_SERVICIO_CREADA',
        message: res.data.message || 'Orden de servicio creada con éxito',
        details: { orden: res.data.details?.orden },
      });
    } catch (error) {
      console.error('[❌ apiProvider] Error en crearOrdenServicio:', error);
      return errorResponse(error, 'Error al crear la orden de servicio.');
    }
  },

  finalizarOrdenServicio: async (ids, orden) => {
    try {
      const res = await axios.put(
        `${baseURL}/os/${ids.ordenId}/finalizar`,
        orden,
        {
          withCredentials: true,
        }
      );

      return successResponse({
        status: res.status,
        code: 'ORDEN_SERVICIO_FINALIZADA',
        message: res.data.message || 'Orden de servicio finalizada con éxito',
        details: { orden: res.data.details?.orden },
      });
    } catch (error) {
      console.error('[❌ apiProvider] Error en finalizarOrdenServicio:', error);
      return errorResponse(error, 'Error al finalizar la orden de servicio.');
    }
  },
};
