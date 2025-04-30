// logic/handleGenerarCodigo.js
import toast from 'react-hot-toast';

export const handleGenerarCodigo = async ({
  hayCodigoActivo,
  codigoActivo,
  startLoading,
  stopLoading,
  generarNuevoCodigo,
  usosSeleccionados,
  activarSpotlight,
  setBotonGenerado,
  setSpotlightActivoId,
}) => {
  if (hayCodigoActivo) {
    toast.error('Ya existe un código activo.');
    return;
  }

  try {
    startLoading();
    const token = localStorage.getItem('token'); // o desde tu AuthContext si lo manejas ahí

    const response = await fetch('http://localhost:5000/api/codigos/generar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ usos: usosSeleccionados }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al generar el código');
    }

    toast.success('Código generado exitosamente');
    generarNuevoCodigo(data.codigo);
    setBotonGenerado(true);
    activarSpotlight(data.codigo.id, setSpotlightActivoId);
  } catch (error) {
    toast.error(error.message);
  } finally {
    stopLoading();
  }
};
