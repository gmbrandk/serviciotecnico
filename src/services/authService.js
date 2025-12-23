// frontend/services/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

export const loginUser = async (email, password) => {
  try {
    const res = await axios.post(
      `${API_URL}/login`,
      { email, password },
      {
        withCredentials: true, // importante para que envíe/reciba cookies
      }
    );
    const { usuario } = res.data;
    if (usuario) return { usuario };
    throw new Error('Respuesta inválida');
  } catch (error) {
    throw new Error(error.response?.data?.mensaje || 'Error al iniciar sesión');
  }
};

export const fetchUsuarioAutenticado = async () => {
  try {
    console.log('[authService] Llamando a /api/auth/me...');
    const response = await axios.get('http://localhost:5000/api/auth/me', {
      withCredentials: true,
    });

    return response.data; // { usuario }
  } catch (error) {
    if (error.response?.status === 401) {
      console.info('[authService] No hay sesión activa');
      return { usuario: null }; // ✅ CLAVE
    }

    console.error(
      '[authService] Error inesperado:',
      error.response?.data || error.message
    );

    throw error; // solo errores reales
  }
};
