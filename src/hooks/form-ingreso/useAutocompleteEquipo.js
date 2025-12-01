// src/hooks/form-ingreso/useAutocompleteEquipo.js
import { useEffect, useRef, useState } from 'react';
import { useEquipos } from '@context/form-ingreso/equiposContext';
import { normalizarEquipo } from '@utils/form-ingreso/normalizarEquipo';

const EMPTY_EQUIPO = normalizarEquipo({
  _id: null,
  nroSerie: '',
  marca: '',
  modelo: '',
  tipo: '',
  procesador: '',
  ram: '',
  almacenamiento: '',
});

export function useAutocompleteEquipo(initialData = null, minLength = 3) {
  const { equipos, buscarEquipos, buscarEquipoPorId } = useEquipos();

  const [query, setQuery] = useState(initialData?.nroSerie || '');
  const [selectedEquipo, setSelectedEquipo] = useState(
    initialData ? normalizarEquipo(initialData) : EMPTY_EQUIPO
  );
  const [isOpen, setIsOpen] = useState(false);

  const isSelecting = useRef(false);
  const loadedInitially = useRef(true);

  // ===================================================================================
  // Sync initialData (NO abrir dropdown al cargar)
  // ===================================================================================
  useEffect(() => {
    if (!initialData) {
      setSelectedEquipo(EMPTY_EQUIPO);
      setQuery('');
      setIsOpen(false);
      loadedInitially.current = false;
      return;
    }

    const normalized = normalizarEquipo(initialData);

    setSelectedEquipo((prev) => {
      const same = JSON.stringify(prev) === JSON.stringify(normalized);
      return same ? prev : normalized;
    });

    setQuery(initialData.nroSerie || '');
    setIsOpen(false);
    loadedInitially.current = true; // ⛔ evita que el debounce abra la lista
  }, [initialData]);

  // ===================================================================================
  // Debounced autocomplete
  // ===================================================================================
  useEffect(() => {
    if (isSelecting.current) return;

    if (!query || query.trim().length < minLength) return;

    const timeout = setTimeout(() => {
      buscarEquipos(query);

      // ❗ SOLO abrir si el usuario escribió
      if (!loadedInitially.current) {
        setIsOpen(true);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [query, buscarEquipos, minLength]);

  // ===================================================================================
  // Select equipo (lookup completo)
  // ===================================================================================
  const seleccionarEquipo = async (equipoParcial) => {
    isSelecting.current = true;
    loadedInitially.current = false;

    setQuery(equipoParcial.nroSerie || '');
    setIsOpen(false);

    const fullData = await buscarEquipoPorId(equipoParcial._id);
    const normalized = normalizarEquipo(fullData || equipoParcial);

    setSelectedEquipo((prev) => {
      const same = JSON.stringify(prev) === JSON.stringify(normalized);
      return same ? prev : normalized;
    });

    setTimeout(() => {
      isSelecting.current = false;
    }, 100);
  };

  // ===================================================================================
  // UI Handlers
  // ===================================================================================
  const onQueryChange = (value) => {
    loadedInitially.current = false;
    setQuery(value);
    setIsOpen(true);
  };

  const abrirResultados = () => {
    loadedInitially.current = false;
    setIsOpen(true);
  };

  const cerrarResultados = () => {
    setTimeout(() => setIsOpen(false), 150);
  };

  return {
    query,
    resultados: equipos,
    selectedEquipo,
    seleccionarEquipo,
    isOpen,
    onQueryChange,
    abrirResultados,
    cerrarResultados,
    setSelectedEquipo,
  };
}
