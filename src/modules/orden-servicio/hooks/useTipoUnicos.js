// hooks/useTiposUnicos.js
import { useEffect, useState } from 'react';

export function useTiposUnicos() {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/tipo-trabajo?unique=true`
        );
        const data = await res.json();

        if (data?.success && Array.isArray(data.details)) {
          setTipos(
            data.details.map((t) => ({
              value: t,
              label: t.charAt(0).toUpperCase() + t.slice(1),
            }))
          );
        }
      } catch (err) {
        console.error('Error al obtener tipos únicos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTipos();
  }, []);

  return { tipos, loading };
}
