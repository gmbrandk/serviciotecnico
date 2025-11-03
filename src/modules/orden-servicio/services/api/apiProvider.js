// src/services/api/apiProvider.js
import axios from 'axios';

const apiProvider = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🧠 Función auxiliar para extraer mensajes claros
const parseErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.mensaje ||
  error?.message ||
  'Error inesperado';

// ⚙️ Interceptor de respuesta (unifica estructura de salida)
apiProvider.interceptors.response.use(
  (response) => ({
    success: true,
    status: response.status,
    message: response.data?.message || 'Operación exitosa',
    details: response.data?.details || response.data,
  }),
  (error) => {
    const status = error?.response?.status || 500;
    const msg = parseErrorMessage(error);
    const code = error?.response?.data?.code || 'ERROR_DESCONOCIDO';

    if (import.meta.env.DEV) {
      console.error(`[API ERROR] ${status}: ${msg}`, error);
    }

    // 💡 No lanzamos error: devolvemos un objeto coherente
    return Promise.resolve({
      success: false,
      status,
      code,
      message: msg,
      details: error?.response?.data?.details || null,
    });
  }
);

export { apiProvider };
