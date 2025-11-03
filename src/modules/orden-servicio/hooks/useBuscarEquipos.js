import { useEffect, useState } from 'react';

export function useBuscarEquipos(query, minLength = 3) {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isNew, setIsNew] = useState(false);

  // 🔹 Autocomplete con texto libre o nroSerie
  useEffect(() => {
    if (!query) {
      setEquipos([]);
      setLoading(false);
      setIsNew(false);
      return;
    }

    if (query.length < minLength) {
      setEquipos([]);
      setLoading(false);
      setIsNew(false);
      return;
    }

    const controller = new AbortController();
    const fetchEquipos = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/equipos/search?nroSerie=${encodeURIComponent(
            query
          )}&mode=autocomplete&limit=10`,
          {
            signal: controller.signal,
            credentials: 'include',
          }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        if (data.success) {
          const normalized = (data.details.results || []).map((e) => ({
            ...e,
            _source: 'autocomplete',
          }));
          setEquipos(normalized);
          setIsNew(Boolean(data.details.isNew)); // 👈 guardar flag
        } else {
          setEquipos([]);
          setIsNew(false);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('[useBuscarEquipos] Error de fetch:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchEquipos, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, minLength]);

  // 🔹 Lookup: traer equipo completo por ID
  const fetchEquipoById = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/equipos/search?id=${id}&mode=lookup`,
        { credentials: 'include' }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success && data.details.results.length > 0) {
        return { ...data.details.results[0], _source: 'lookup' };
      }
      return null;
    } catch (err) {
      console.error('[useBuscarEquipos:lookup] Error:', err);
      return null;
    }
  };

  return { equipos, loading, isNew, fetchEquipoById };
}
