import { useState, useCallback } from 'react';

/**
 * Hook para manejar el estado de carga (loading).
 * Ideal para mostrar spinners en procesos asíncronos.
 */
const useGlobalLoading = () => {
  const [loading, setLoading] = useState(false);

  const startLoading = useCallback(() => setLoading(true), []);
  const stopLoading = useCallback(() => setLoading(false), []);

  const isLoading = loading;
  return { isLoading, startLoading, stopLoading };
};

export default useGlobalLoading;
