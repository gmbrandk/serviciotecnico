import { useEquipos } from '@context/form-ingreso/equiposContext';
import { normalizarEquipo } from '@utils/form-ingreso/normalizarEquipo';
import { useEffect, useRef, useState } from 'react';

const EMPTY = normalizarEquipo({
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

  const [query, setQuery] = useState('');
  const [selectedEquipo, setSelectedEquipo] = useState(EMPTY);
  const [isOpen, setIsOpen] = useState(false);

  const isSelecting = useRef(false);
  const isInitialLoad = useRef(true);

  // ============================================================
  // SYNC provider → hook (solo si difiere)
  // ============================================================
  useEffect(() => {
    const normalized = initialData ? normalizarEquipo(initialData) : null;
    const currentId = selectedEquipo?._id ?? null;
    const incomingId = normalized?._id ?? null;

    console.debug('🟦 useAutocompleteEquipo SYNC', { incomingId, currentId });

    if (!normalized) {
      if (currentId !== null) {
        console.info(
          '🟦 useAutocompleteEquipo: initialData null → limpiando selección actual'
        );
        setSelectedEquipo(EMPTY);
        setQuery('');
      }
      isInitialLoad.current = false;
      return;
    }

    if (incomingId !== currentId) {
      console.info(
        '🟦 useAutocompleteEquipo: nuevo equipo entrante distinto, actualizando selectedEquipo',
        incomingId
      );
      setSelectedEquipo(normalized);
      setQuery(normalized.nroSerie || '');
    } else {
      console.debug(
        '🟦 useAutocompleteEquipo: incoming equipo coincide con el actual, nada que hacer'
      );
    }

    if (isOpen) {
      console.debug(
        '🟦 useAutocompleteEquipo: cerrando dropdown por sincronización'
      );
      setIsOpen(false);
    }
    isInitialLoad.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, selectedEquipo]);

  // ============================================================
  // Debounced búsqueda
  // ============================================================
  useEffect(() => {
    console.debug('🟦 useAutocompleteEquipo debounce', {
      query,
      isSelecting: isSelecting.current,
      isInitialLoad: isInitialLoad.current,
    });

    if (isSelecting.current) return;
    if (isInitialLoad.current) return;
    if (!query || query.trim().length < minLength) {
      console.debug(
        '🟦 useAutocompleteEquipo: query ignorada por longitud insuficiente',
        { length: (query || '').length, minLength }
      );
      return;
    }

    const timeout = setTimeout(() => {
      console.info(
        '🟦 useAutocompleteEquipo: buscarEquipos con query',
        query.trim()
      );
      buscarEquipos(query.trim());
      setIsOpen(true);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, buscarEquipos, minLength]);

  // ============================================================
  // Seleccionar equipo (lookup completo)
  // ============================================================
  const seleccionarEquipo = async (e) => {
    console.info('🟦 useAutocompleteEquipo: seleccionarEquipo', e?._id);
    isSelecting.current = true;
    isInitialLoad.current = false;

    setQuery(e.nroSerie || '');
    setIsOpen(false);

    try {
      const full = await buscarEquipoPorId(e._id);
      const normalized = normalizarEquipo(full || e);
      console.debug(
        '🟦 useAutocompleteEquipo: equipo completo recuperado/normalizado',
        normalized?._id
      );
      setSelectedEquipo(normalized);
    } catch (err) {
      console.error(
        '🟦 useAutocompleteEquipo: error al recuperar equipo por id',
        err
      );
      setSelectedEquipo(normalizarEquipo(e));
    }

    setTimeout(() => (isSelecting.current = false), 80);
  };

  // ============================================================
  // Handlers UI
  // ============================================================
  const onQueryChange = (v) => {
    isInitialLoad.current = false;
    console.debug('🟦 useAutocompleteEquipo: onQueryChange', v);
    setQuery(v);
    setIsOpen(true);
  };

  return {
    query,
    resultados: equipos,
    selectedEquipo,
    seleccionarEquipo,
    isOpen,
    onQueryChange,
    abrirResultados: () => {
      isInitialLoad.current = false;
      setIsOpen(true);
    },
    cerrarResultados: () => setTimeout(() => setIsOpen(false), 150),
    setSelectedEquipo,
  };
}
