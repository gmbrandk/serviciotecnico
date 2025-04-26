import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

export const loginUser = async (email, password) => {
  try {
    const res = await axios.post(`${API_URL}/login`, { email, password });
    const { token, usuario } = res.data;

    if (token && usuario) {
      return { token, usuario };
    }

    throw new Error('Error en la respuesta del servidor');
  } catch (error) {
    console.error(error.response);
    throw new Error(error.response?.data?.mensaje || 'Error al iniciar sesión');
  }
};

export default loginUser;
