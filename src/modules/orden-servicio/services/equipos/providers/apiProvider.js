import { errorResponse, successResponse } from '@utils/responseFormatter';
import axios from 'axios';

const baseURL = 'http://localhost:5000/api';

export const apiProvider = {
  crearEquipo: async (equipoData) => {
    try {
      const res = await axios.post(`${baseURL}/equipos`, equipoData, {
        withCredentials: true,
      });

      return successResponse({
        status: res.status,
        code: 'EQUIPO_CREADO',
        message: res.data.message || 'Equipo creado con éxito',
        details: { equipo: res.data.details?.equipo },
      });
    } catch (error) {
      console.error('[❌ apiProvider] Error en crearEquipo:', error);
      return errorResponse(error, 'Error al crear equipo.');
    }
  },
};
