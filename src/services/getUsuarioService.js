import axios from 'axios';

export const getUsuarios = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/usuarios', {
      withCredentials: true,
    });
    return response.data.usuarios;
  } catch (error) {
    throw new Error(
      error.response?.data?.mensaje || 'Error al cargar usuarios'
    );
  }
};
