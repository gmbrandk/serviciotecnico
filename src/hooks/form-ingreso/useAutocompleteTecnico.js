import { useTecnicos } from '@context/form-ingreso/tecnicosContext';
import { normalizarTecnico } from '@utils/form-ingreso/normalizarTecnico';
import { useEffect, useRef, useState } from 'react';

const EMPTY = normalizarTecnico({
  _id: null,
  nombres: '',
  apellidos: '',
  nombreCompleto: '',
  especialidad: '',
});

export function useAutocompleteTecnico(initial = null, minLength = 2) {
  const { tecnicos, buscarTecnicos, buscarTecnicoPorId } = useTecnicos();

  const [query, setQuery] = useState('');
  const [selectedTecnico, setSelectedTecnico] = useState(EMPTY);
  const [isOpen, setIsOpen] = useState(false);

  // Flags robustos → prevención total de loops
  const isSelecting = useRef(false);
  const isExternalUpdate = useRef(false);
  const prevInitialRef = useRef(null);
  const ignoreDebounce = useRef(true);

  // ============================================================
  // 1. SYNC provider → componente (sin loops)
  // ============================================================
  useEffect(() => {
    const normalized = initial ? normalizarTecnico(initial) : null;

    // Si viene null → limpiar
    if (!normalized) {
      if (selectedTecnico._id !== null || query !== '') {
        setSelectedTecnico(EMPTY);
        setQuery('');
      }
      prevInitialRef.current = null;
      return;
    }

    // Evitar loops: si no cambió realmente, no actualizar
    const same =
      JSON.stringify(normalized) === JSON.stringify(prevInitialRef.current);

    if (same) return;

    prevInitialRef.current = normalized;
    isExternalUpdate.current = true;

    setSelectedTecnico(normalized);
    setQuery(normalized.nombreCompleto || '');
    setIsOpen(false);

    ignoreDebounce.current = true;
  }, [initial]); // ✔ NO depende de selectedTecnico, ni query

  // ============================================================
  // 2. Debounced búsqueda (solo usuario)
  // ============================================================
  useEffect(() => {
    if (isSelecting.current) return;
    if (isExternalUpdate.current) return;

    if (ignoreDebounce.current) {
      ignoreDebounce.current = false;
      return;
    }

    const q = (query || '').trim();
    if (!q || q.length < minLength) return;

    const timeout = setTimeout(() => {
      buscarTecnicos(q);
      setIsOpen(true);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, minLength, buscarTecnicos]);

  // ============================================================
  // 3. Seleccionar técnico (lookup + normalizado)
  // ============================================================
  const seleccionarTecnico = async (t) => {
    isSelecting.current = true;
    isExternalUpdate.current = false;
    ignoreDebounce.current = true;

    setQuery(t.nombreCompleto || '');
    setIsOpen(false);

    try {
      const full = await buscarTecnicoPorId(t._id);
      const normalized = normalizarTecnico(full || t);
      setSelectedTecnico(normalized);
    } catch (err) {
      console.error('useAutocompleteTecnico: error buscarTecnicoPorId', err);
      setSelectedTecnico(normalizarTecnico(t));
    }

    setTimeout(() => {
      isSelecting.current = false;
    }, 80);
  };

  // ============================================================
  // 4. Cambios por usuario
  // ============================================================
  const onQueryChange = (v) => {
    if (isExternalUpdate.current) {
      isExternalUpdate.current = false;
      setQuery(v);
      return;
    }

    ignoreDebounce.current = false;
    setQuery(v);
    setSelectedTecnico(EMPTY);

    if (!isSelecting.current) setIsOpen(true);
  };

  // ============================================================
  // API pública
  // ============================================================
  return {
    query,
    resultados: tecnicos,
    selectedTecnico,

    onQueryChange,
    seleccionarTecnico,

    isOpen,
    abrirResultados: () => {
      ignoreDebounce.current = false;
      setIsOpen(true);
    },
    cerrarResultados: () => {
      setTimeout(() => setIsOpen(false), 150);
    },

    setSelectedTecnico,
  };
}
