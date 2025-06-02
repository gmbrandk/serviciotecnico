import axios from 'axios';
import { normalizedId } from '@utils/formatters';

const baseURL = 'http://localhost:5000/api';

export const apiProvider = {
  obtenerUsuarios: async () => {
    try {
      console.log('[🔄 apiProvider] solicitando /api/usuarios');
      const res = await axios.get(`${baseURL}/usuarios`, {
        withCredentials: true,
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

  editarUsuario: async (id, datos) => {
    try {
      const res = await axios.put(`${baseURL}/usuarios/editar/${id}`, datos, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      console.error('[❌ apiProvider] Error en editarUsuario:', error);
      throw (
        error.response?.data || {
          mensaje: 'Error desconocido al editar usuario',
        }
      );
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

  cambiarRolUsuario: async (id, nuevoRol, contrasenaConfirmacion = '') => {
    console.log('✅ Llamando a cambiarRolUsuario con:', {
      id,
      nuevoRol,
      contrasenaConfirmacion,
    });

    try {
      const res = await axios.patch(
        `${baseURL}/usuarios/editar/${id}/rol`,
        { nuevoRol, contrasenaConfirmacion },
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      console.error('[❌ apiProvider] Error en cambiarRolUsuario:', error);
      throw (
        error.response?.data || {
          mensaje: 'Error desconocido al cambiar el rol',
        }
      );
    }
  },
};
