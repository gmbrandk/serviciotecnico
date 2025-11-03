import { useEffect, useState } from 'react';

const baseUrl = import.meta.env.VITE_API_URL;

export function useBuscarClientes(dni, minLength = 4) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [details, setDetails] = useState(null); // 🔹 guarda todo el details
  const [isNew, setIsNew] = useState(false); // 🔹 flag directo

  useEffect(() => {
    if (!dni || dni.length < minLength) {
      setClientes([]);
      setLoading(false);
      setError(null);
      setIsNew(false);
      setDetails(null);
      return;
    }

    const controller = new AbortController();
    const fetchClientes = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${baseUrl}/api/clientes/search?dni=${dni}&mode=autocomplete`,
          {
            signal: controller.signal,
            credentials: 'include',
          }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (data.success) {
          const raw = data.details || {};
          setClientes(
            (raw.results || []).map((c) => ({
              ...c,
              _source: 'autocomplete',
            }))
          );
          setIsNew(Boolean(raw.isNew));
          setDetails(raw);
        } else {
          setClientes([]);
          setIsNew(false);
          setDetails(null);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err);
          setClientes([]);
          setIsNew(false);
          setDetails(null);
        }
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchClientes, 300);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [dni, minLength, baseUrl]);

  const fetchClienteById = async (id) => {
    try {
      const res = await fetch(
        `${baseUrl}/api/clientes/search?id=${id}&mode=lookup`,
        { credentials: 'include' }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.success && data.details.results.length > 0
        ? { ...data.details.results[0], _source: 'lookup' }
        : null;
    } catch (err) {
      console.error('[useBuscarClientes:lookup] Error:', err);
      return null;
    }
  };

  return { clientes, loading, error, isNew, details, fetchClienteById };
}
