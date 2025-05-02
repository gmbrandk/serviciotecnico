import toast from 'react-hot-toast';

export const handleGenerarCodigo = async ({
  hayCodigoActivo,
  codigos,
  setCodigos,
  startLoading,
  stopLoading,
  usosSeleccionados,
  activarSpotlight,
  setBotonGenerado,
  setSpotlightActivoId,
}) => {
  if (hayCodigoActivo) {
    toast.error('Ya existe un código activo.');

    // Activamos el spotlight para el código activo
    const codigoActivo = codigos.find(c => c.estado === 'activo');
    if (codigoActivo) {
      activarSpotlight(setSpotlightActivoId, codigoActivo._id); // Usa _id directamente
    }
    return;
  }

  try {
    startLoading();
    const token = localStorage.getItem('token');

    // 🕐 Simulamos retraso de al menos 1 segundo para visibilidad del loading
    await new Promise(resolve => setTimeout(resolve, 1000));

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

    // Agregamos el nuevo código al estado
    setCodigos([...codigos, data.codigo]);

    // Indicamos que el código ha sido generado
    setBotonGenerado(true);

    // Activamos el spotlight para el nuevo código generado
    activarSpotlight(setSpotlightActivoId, data.codigo._id); // Usa _id para el nuevo código

  } catch (error) {
    toast.error(error.message);
  } finally {
    stopLoading();
  }
};

