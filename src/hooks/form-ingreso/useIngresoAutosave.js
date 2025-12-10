// src/hooks/form-ingreso/useIngresoAutosave.js
import { useCallback, useRef, useState } from 'react';

export default function useIngresoAutosave({
  key,
  buildDiff,
  enabledInitial = true,
  debounceMs = 500,
}) {
  const [persistEnabled, setPersistEnabled] = useState(() => {
    const stored = localStorage.getItem(`${key}:enabled`);
    if (stored === null) return enabledInitial;
    return stored === 'true';
  });

  const timerRef = useRef(null);

  // guardar toggle en localStorage
  const setPersist = useCallback(
    (value) => {
      setPersistEnabled(value);
      localStorage.setItem(`${key}:enabled`, value ? 'true' : 'false');
    },
    [key]
  );

  // autosave principal, protegido
  const autosave = useCallback(() => {
    if (!persistEnabled) return;

    const diff = buildDiff();
    if (!diff || Object.keys(diff).length === 0) return;

    const payload = {
      timestamp: Date.now(),
      summary: {
        cliente: !!diff.cliente,
        equipo: !!diff.equipo,
        tecnico: !!diff.tecnico,
        lineas: diff.orden?.lineasServicio
          ? Object.keys(diff.orden.lineasServicio).length
          : 0,
      },
      data: diff,
    };

    localStorage.setItem(key, JSON.stringify(payload));
    console.log(`💽 [Autosave] Saved key=${key}`, payload);
  }, [persistEnabled, buildDiff, key]);

  // debounce wrapper
  const debouncedAutosave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      autosave();
    }, debounceMs);
  }, [autosave, debounceMs]);

  // cargar autosave existente
  const loadAutosave = useCallback(() => {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (!parsed?.data) return null;
      return parsed;
    } catch {
      return null;
    }
  }, [key]);

  // descartar
  const discardAutosave = useCallback(() => {
    localStorage.removeItem(key);
  }, [key]);

  return {
    autosave: debouncedAutosave, // ✅ usar el debounced
    loadAutosave,
    discardAutosave,
    persistEnabled,
    setPersistEnabled: setPersist,
    autosaveReady: true,
  };
}
