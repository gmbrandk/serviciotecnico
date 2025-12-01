// hooks/form-ingreso/useAutocompleteTecnico.js
import { useEffect, useRef, useState } from 'react';
import { useTecnicos } from '@context/form-ingreso/tecnicosContext';
import { normalizarTecnico } from '@utils/form-ingreso/normalizarTecnico';

const EMPTY_TECNICO = normalizarTecnico({
  _id: null,
  nombres: '',
  apellidos: '',
  nombreCompleto: '',
  especialidad: '',
});

export function useAutocompleteTecnico(initialValue = null, minLength = 2) {
  const { tecnicos, buscarTecnicos, buscarTecnicoPorId } = useTecnicos();

  const [query, setQuery] = useState('');
  const [selectedTecnico, setSelectedTecnico] = useState(EMPTY_TECNICO);
  const [isOpen, setIsOpen] = useState(false);

  const isSelecting = useRef(false);
  const loadedInitially = useRef(true);

  // ============================================================
  // Inicializar desde external initialValue (NO abrir dropdown)
  // ============================================================
  useEffect(() => {
    if (!initialValue) {
      setSelectedTecnico(EMPTY_TECNICO);
      setQuery('');
      setIsOpen(false);
      loadedInitially.current = false;
      return;
    }

    const normalized = normalizarTecnico(initialValue);

    setSelectedTecnico((prev) =>
      JSON.stringify(prev) === JSON.stringify(normalized) ? prev : normalized
    );

    setQuery(normalized.nombreCompleto || '');
    setIsOpen(false);
    loadedInitially.current = true;
  }, [initialValue]);

  // ============================================================
  // Debounced búsqueda
  // ============================================================
  useEffect(() => {
    if (isSelecting.current) return;
    if (!query || query.trim().length < minLength) return;

    const timeout = setTimeout(() => {
      buscarTecnicos(query.trim());

      if (!loadedInitially.current) {
        setIsOpen(true);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [query, minLength, buscarTecnicos]);

  // ============================================================
  // Seleccionar técnico y hacer lookup completo
  // ============================================================
  const seleccionarTecnico = async (tParcial) => {
    isSelecting.current = true;
    loadedInitially.current = false;

    setQuery(tParcial.nombreCompleto || '');
    setIsOpen(false);

    const full = await buscarTecnicoPorId(tParcial._id);
    const normalized = normalizarTecnico(full || tParcial);

    setSelectedTecnico(normalized);

    setTimeout(() => {
      isSelecting.current = false;
    }, 100);
  };

  const onQueryChange = (value) => {
    loadedInitially.current = false;
    setQuery(value);
    setIsOpen(true);
  };

  return {
    query,
    resultados: tecnicos,
    selectedTecnico,
    isOpen,
    onQueryChange,
    seleccionarTecnico,
    abrirResultados: () => {
      loadedInitially.current = false;
      setIsOpen(true);
    },
    cerrarResultados: () => setTimeout(() => setIsOpen(false), 150),
  };
}
