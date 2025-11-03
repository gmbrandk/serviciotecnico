import { useCallback, useEffect, useRef, useState } from 'react';

export function useTiposTrabajo() {
  const [tiposTrabajo, setTiposTrabajo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🧠 Ref de seguridad para evitar updates después del unmount
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchTiposTrabajo = useCallback(async () => {
    if (!isMounted.current) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/tipo-trabajo/`,
        {
          headers: { Accept: 'application/json' },
        }
      );

      if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

      const data = await res.json();

      const payload = Array.isArray(data)
        ? data
        : data.details || data.tiposTrabajo;

      if (!Array.isArray(payload))
        throw new Error('Respuesta inválida del servidor');

      const mapped = payload.map((t) => ({
        value: t._id,
        label: t.nombre,
        tipo: t.tipo || 'general',
        precioBase: t.precioBase ?? 0,
      }));

      // 🕐 Delay artificial (ej. 1.5 segundos)
      // await new Promise((resolve) => setTimeout(resolve, 1500));

      if (isMounted.current) {
        setTiposTrabajo(mapped);
        setError(null);
      }
    } catch (err) {
      console.error('❌ Error cargando tipos de trabajo:', err);
      if (isMounted.current) {
        setError(err.message || 'Error desconocido');
        setTiposTrabajo([]);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTiposTrabajo();
  }, [fetchTiposTrabajo]);

  return {
    tiposTrabajo,
    loading,
    error,
    refetch: fetchTiposTrabajo,
  };
}
