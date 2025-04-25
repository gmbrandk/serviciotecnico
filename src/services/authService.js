import axios from 'axios';

const loginUser = async (email, password) => {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
    const { token, usuario } = res.data;

    if (token && usuario) {
      return { token, usuario };
    }
    throw new Error('Error en la respuesta del servidor');
  } catch (error) {
    throw new Error(error.response?.data?.mensaje || 'Error al iniciar sesión');
  }
};

export default loginUser;
