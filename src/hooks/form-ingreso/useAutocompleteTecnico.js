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

  const isSelecting = useRef(false);
  const isInitialLoad = useRef(true);

  // ============================================================
  // SYNC provider → hook (solo si difiere)
  // ============================================================
  useEffect(() => {
    const normalized = initial ? normalizarTecnico(initial) : null;
    const currentId = selectedTecnico?._id ?? null;
    const incomingId = normalized?._id ?? null;

    console.debug('🟦 useAutocompleteTecnico SYNC', { incomingId, currentId });

    if (!normalized) {
      if (currentId !== null) {
        console.info(
          '🟦 useAutocompleteTecnico: initial null → limpiando selección'
        );
        setSelectedTecnico(EMPTY);
        setQuery('');
      }
      isInitialLoad.current = false;
      return;
    }

    if (incomingId !== currentId) {
      console.info(
        '🟦 useAutocompleteTecnico: new incoming tecnico, updating selected',
        incomingId
      );
      setSelectedTecnico(normalized);
      setQuery(normalized.nombreCompleto || '');
    } else {
      console.debug(
        '🟦 useAutocompleteTecnico: incoming equals current, no update'
      );
    }

    if (isOpen) setIsOpen(false);
    isInitialLoad.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial, selectedTecnico]);

  // ============================================================
  // Debounce
  // ============================================================
  useEffect(() => {
    console.debug('🟦 useAutocompleteTecnico debounce', {
      query,
      isSelecting: isSelecting.current,
      isInitialLoad: isInitialLoad.current,
    });

    if (isSelecting.current) return;
    if (isInitialLoad.current) return;
    if (!query || query.trim().length < minLength) {
      console.debug(
        '🟦 useAutocompleteTecnico: query ignorada por longitud insuficiente',
        { length: (query || '').length, minLength }
      );
      return;
    }

    const timeout = setTimeout(() => {
      console.info(
        '🟦 useAutocompleteTecnico: buscarTecnicos con query',
        query.trim()
      );
      buscarTecnicos(query.trim());
      setIsOpen(true);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, minLength, buscarTecnicos]);

  // ============================================================
  // Seleccionar técnico
  // ============================================================
  const seleccionarTecnico = async (t) => {
    console.info(
      '🟦 useAutocompleteTecnico: seleccionarTecnico llamado para',
      t?._id
    );
    isSelecting.current = true;
    isInitialLoad.current = false;

    setQuery(t.nombreCompleto || '');
    setIsOpen(false);

    try {
      const full = await buscarTecnicoPorId(t._id);
      const normalized = normalizarTecnico(full || t);
      console.debug(
        '🟦 useAutocompleteTecnico: técnico completo recuperado/normalizado',
        normalized?._id
      );
      setSelectedTecnico(normalized);
    } catch (err) {
      console.error(
        '🟦 useAutocompleteTecnico: error recuperando técnico por id',
        err
      );
      setSelectedTecnico(normalizarTecnico(t));
    }

    setTimeout(() => (isSelecting.current = false), 80);
  };

  // ============================================================
  // Handlers UI
  // ============================================================
  const onQueryChange = (v) => {
    isInitialLoad.current = false;
    console.debug('🟦 useAutocompleteTecnico: onQueryChange', v);
    setQuery(v);
    setIsOpen(true);
  };

  return {
    query,
    resultados: tecnicos,
    selectedTecnico,
    seleccionarTecnico,
    isOpen,
    onQueryChange,
    abrirResultados: () => {
      isInitialLoad.current = false;
      setIsOpen(true);
    },
    cerrarResultados: () => setTimeout(() => setIsOpen(false), 150),
    setSelectedTecnico,
  };
}
