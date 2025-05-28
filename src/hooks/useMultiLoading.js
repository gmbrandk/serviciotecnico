import { useState, useCallback } from 'react';

/**
 * Hook para manejar múltiples estados de carga por ID (útil para listas de ítems).
 */
const useMultiLoading = () => {
  const [loadingMap, setLoadingMap] = useState({});

  const startLoading = useCallback((id) => {
    setLoadingMap((prev) => ({ ...prev, [id]: true }));
  }, []);

  const stopLoading = useCallback((id) => {
    setLoadingMap((prev) => ({ ...prev, [id]: false }));
  }, []);

  const isLoading = loadingMap;

  return { isLoading, startLoading, stopLoading };
};

export default useMultiLoading;
