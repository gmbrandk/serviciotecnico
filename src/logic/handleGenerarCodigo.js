import { normalizedId } from '@utils/formatters';
import { showToast } from '@services/toast/toastService';

export const handleGenerarCodigo = async ({
  hayCodigoActivo,
  codigos,
  setCodigos,
  usosSeleccionados,
  activarSpotlight,
  setSpotlightActivoId,
  setBotonGenerado, // (opcional): Para marcar botón como generado
  startLoading, // Requiere ser pasado desde el context
  stopLoading,
}) => {
  if (hayCodigoActivo) {
    showToast('Ya existe un código activo');

    // Activamos spotlight en el código activo actual
    const codigoActivo = codigos.find((c) => c.estado === 'activo');
    if (codigoActivo) {
      activarSpotlight(setSpotlightActivoId, normalizedId(codigoActivo));
    }
    return;
  }

  try {
    startLoading?.(); // ✅ Evitamos error si no se pasa

    const response = await fetch('http://localhost:5000/api/codigos/generar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 🔐 Envía la cookie JWT
      body: JSON.stringify({ usos: usosSeleccionados }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al generar el código');
    }

    showToast('Código generado exitosamente', 'success');

    // Aseguramos que el nuevo código tenga `_id` unificado
    const nuevoCodigo = { ...data.codigo, _id: normalizedId(data.codigo) };
    setCodigos((prev) => [{ ...nuevoCodigo }, ...prev]);

    // Spotlight al nuevo código generado
    activarSpotlight(setSpotlightActivoId, nuevoCodigo._id);

    // ✅ Indicamos que el botón fue usado (si se provee)
    setBotonGenerado?.(true);
  } catch (error) {
    toast.error(error.message);
  } finally {
    stopLoading?.(); // ✅ Siempre cerramos loading
  }
};
