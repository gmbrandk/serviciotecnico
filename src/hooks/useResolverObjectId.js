import { useEffect, useState } from 'react';

export function useResolverObjectId({ value, lookupFn }) {
  const [resolved, setResolved] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Caso 1: no hay valor
    if (!value) {
      setResolved(null);
      return;
    }

    // Caso 2: ya es un objeto completo → devolverlo como está
    if (typeof value === 'object') {
      setResolved(value);
      return;
    }

    // Caso 3: es un ID → buscarlo
    let cancel = false;
    setLoading(true);

    lookupFn(value)
      .then((obj) => {
        if (!cancel) setResolved(obj ?? null);
      })
      .finally(() => {
        if (!cancel) setLoading(false);
      });

    return () => {
      cancel = true;
    };
  }, [value, lookupFn]);

  return { resolved, loading };
}
