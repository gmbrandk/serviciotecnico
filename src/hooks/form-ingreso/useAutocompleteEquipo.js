import { useEquipos } from '@context/form-ingreso/equiposContext';
import { useEffect, useRef, useState } from 'react';

const EMPTY = {
  _id: null,
  nroSerie: '',
  marca: '',
  modelo: '',
  descripcion: '',
};

export function useAutocompleteEquipo(initialData = null, minLength = 3) {
  const { equipos, buscarEquipos, buscarEquipoPorId } = useEquipos();

  const [query, setQuery] = useState('');
  const [selectedEquipo, setSelectedEquipo] = useState(EMPTY);
  const [isOpen, setIsOpen] = useState(false);

  const isSelecting = useRef(false);
  const isExternalUpdate = useRef(false);
  const prevInitialRef = useRef(null);
  const ignoreDebounce = useRef(true);

  // ============================================================
  // SYNC provider → componente
  // ============================================================
  useEffect(() => {
    if (!initialData) {
      if (selectedEquipo._id !== null || query !== '') {
        setSelectedEquipo(EMPTY);
        setQuery('');
      }
      prevInitialRef.current = null;
      return;
    }

    const same =
      JSON.stringify(initialData) === JSON.stringify(prevInitialRef.current);

    if (same) return;

    prevInitialRef.current = initialData;
    isExternalUpdate.current = true;

    setSelectedEquipo(initialData);
    setQuery(initialData.nroSerie || '');
    setIsOpen(false);

    ignoreDebounce.current = true;
  }, [initialData]);

  // ============================================================
  // Debounce de búsqueda
  // ============================================================
  useEffect(() => {
    if (isSelecting.current) return;
    if (isExternalUpdate.current) return;
    if (ignoreDebounce.current) {
      ignoreDebounce.current = false;
      return;
    }

    const nroSerie = (query || '').trim();
    if (!nroSerie || nroSerie.length < minLength) return;

    const timeout = setTimeout(() => {
      buscarEquipos(nroSerie);
      setIsOpen(true);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, minLength, buscarEquipos]);

  // ============================================================
  // Selección manual
  // ============================================================
  const seleccionarEquipo = async (e) => {
    isSelecting.current = true;
    isExternalUpdate.current = false;
    ignoreDebounce.current = true;

    setQuery(e.nroSerie || '');
    setIsOpen(false);

    try {
      const full = await buscarEquipoPorId(e._id);
      setSelectedEquipo(full || e);
    } catch (err) {
      console.error('useAutocompleteEquipo → buscarEquipoPorId error', err);
      setSelectedEquipo(e);
    }

    setTimeout(() => {
      isSelecting.current = false;
    }, 50);
  };

  // ============================================================
  // Input del usuario
  // ============================================================
  const onQueryChange = (value) => {
    if (isExternalUpdate.current) {
      isExternalUpdate.current = false;
      setQuery(value);
      return;
    }

    ignoreDebounce.current = false;
    setQuery(value);
    setSelectedEquipo(EMPTY);

    if (!isSelecting.current) {
      setIsOpen(true);
    }
  };

  return {
    query,
    resultados: equipos,
    selectedEquipo,

    onQueryChange,
    seleccionarEquipo,

    isOpen,
    abrirResultados: () => {
      ignoreDebounce.current = false;
      setIsOpen(true);
    },
    cerrarResultados: () => {
      setTimeout(() => setIsOpen(false), 150);
    },

    setSelectedEquipo,
  };
}
