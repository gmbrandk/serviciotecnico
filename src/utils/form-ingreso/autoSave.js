import { useEffect, useRef } from 'react';

export function useAutosave({ key, value, enabled = true, delay = 300 }) {
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      localStorage.setItem(key, JSON.stringify(value));
    }, delay);

    return () => clearTimeout(timeoutRef.current);
  }, [value, enabled, key]);

  return {
    clear: () => localStorage.removeItem(key),
    load: () => {
      const saved = localStorage.getItem(key);
      try {
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    },
  };
}
