import axios from "axios";

export const registerUser = async (formData) => {
  try {
    const res = await axios.post(
      "http://localhost:5000/api/auth/register",
      formData,
      { withCredentials: true }
    );
    return { success: true, data: res.data };
  } catch (error) {
    const mensaje = error.response?.data?.mensaje || "Error desconocido";
    const detalles = error.response?.data?.detalles || error.message;
    return {
      success: false,
      mensaje,
      detalles,
    };
  }
};

export default registerUser;
