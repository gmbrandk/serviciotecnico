//@services/usuarios/providers/apiProvider.js //data Real
import axios from 'axios';
import { normalizedId } from '@utils/formatters';

const baseURL = 'http://localhost:5000/api';

export const apiProvider = {
  obtenerUsuarios: async () => {
    try {
      console.log('[🔄 apiProvider] solicitando /api/usuarios');
      const res = await axios.get(`${baseURL}/usuarios`, {
        withCredentials: true, // <== para enviar cookies HttpOnly
      });
      console.log('[✅ respuesta]', res.data);
      return res.data.usuarios.map((u) => ({
        ...u,
        id: normalizedId(u),
      }));
    } catch (error) {
      console.error('[❌ apiProvider] Error en obtenerUsuarios:', error);
      throw error;
    }
  },

  cambiarEstado: async (id, activo) => {
    try {
      const res = await axios.patch(
        `${baseURL}/usuarios/${id}/estado`,
        { activo },
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      console.error('[❌ apiProvider] Error en cambiarEstado:', error);
      throw (
        error.response?.data || {
          mensaje: 'Error desconocido al actualizar estado',
        }
      );
    }
  },
};
