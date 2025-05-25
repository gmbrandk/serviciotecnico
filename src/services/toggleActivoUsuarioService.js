import axios from 'axios';

export const toggleActivoUsuario = async (id, activo) => {
  try {
    const response = await axios.patch(
      `http://localhost:5000/api/usuarios/${id}/estado`,
      { activo },
      { withCredentials: true }
    );
    return response.data; // aquí viene { success, mensaje, usuario }
  } catch (error) {
    // Lanzar error para manejarlo en el frontend
    throw (
      error.response?.data || {
        mensaje: 'Error desconocido al actualizar estado',
      }
    );
  }
};
