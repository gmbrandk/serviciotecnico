import axios from 'axios';

const API_URL = 'http://localhost:5000/api/usuarios';

const editarUsuario = async (id, datosActualizados) => {
  try {
    const res = await axios.put(`${API_URL}/${id}`, datosActualizados, {
      withCredentials: true,
    });

    const { success, mensaje, usuario } = res.data;

    if (!success) throw new Error(mensaje || 'Error desconocido');

    return { success, mensaje, usuario };
  } catch (error) {
    const mensaje = error.response?.data?.mensaje || 'Error al editar usuario';
    const detalles = error.response?.data?.detalles || error.message;
    return { success: false, mensaje, detalles };
  }
};

export default editarUsuario;
