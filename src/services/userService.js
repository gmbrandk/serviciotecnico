import axios from 'axios';

export const registerUser = async (formData) => {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/register', formData);

    if (res.status === 201 || res.data.success) {
      const { token } = res.data;
      localStorage.setItem('token', token);
      return { success: true };
    }
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    if (error.response && error.response.data?.mensaje) {
      return { error: error.response.data.mensaje };
    }
    return { error: 'Ocurrió un error al registrar. Intenta de nuevo.' };
  }
};
