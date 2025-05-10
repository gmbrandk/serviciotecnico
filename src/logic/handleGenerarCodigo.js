import toast from 'react-hot-toast';
import { normalizedId } from '@utils/formatters';

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
      activarSpotlight(setSpotlightActivoId, codigoActivo.id); // Usa _id directamente
    }
    return;
  }

  try {
    startLoading();

    // 🕐 Simulamos retraso de al menos 1 segundo para visibilidad del loading
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Realizamos la petición con las cookies automáticamente adjuntadas
    const response = await fetch('http://localhost:5000/api/codigos/generar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 🔐 Envía la cookie JWT automáticamente
      body: JSON.stringify({ usos: usosSeleccionados }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al generar el código');
    }

    toast.success('Código generado exitosamente');

    // Usamos normalizedId para asegurarnos de que _id esté correctamente asignado
    const nuevoCodigo = { ...data.codigo, _id: normalizedId(data.codigo) };
    setCodigos(prev => [{ ...nuevoCodigo }, ...prev]);

    // Indicamos que el código ha sido generado
    setBotonGenerado(true);

    console.log('Respuesta completa:', data);
    console.log('Código devuelto:', data.codigo);

    // Activamos el spotlight para el nuevo código generado
    activarSpotlight(setSpotlightActivoId, nuevoCodigo._id); // Usa _id para el nuevo código

  } catch (error) {
    toast.error(error.message);
  } finally {
    stopLoading();
  }
};
