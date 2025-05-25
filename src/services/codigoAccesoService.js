import axios from 'axios';

export const fetchCodigos = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/codigos', {
      withCredentials: true,
    });
    return response.data.codigos;
  } catch (error) {
    throw new Error(
      error.response?.data?.mensaje || 'Error al cargar los códigos'
    );
  }
};
