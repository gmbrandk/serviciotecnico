import { useState, useCallback } from 'react';

const useMultiLoading = () => {
  const [loadingMap, setLoadingMap] = useState({});

  const startLoading = useCallback((key) => {
    setLoadingMap((prev) => ({ ...prev, [key]: true }));
  }, []);

  const stopLoading = useCallback((key) => {
    setLoadingMap((prev) => ({ ...prev, [key]: false }));
  }, []);

  const isLoading = useCallback((key) => !!loadingMap[key], [loadingMap]);

  const resetAll = () => setLoadingMap({});

  return { isLoading, startLoading, stopLoading, resetAll };
};

export default useMultiLoading;
