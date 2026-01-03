import { useEquipos } from '@context/form-ingreso/equiposContext';
import { useEffect, useRef, useState } from 'react';

/*───────────────────────────────────────────────
  Hook UX puro
───────────────────────────────────────────────*/
export function useAutocompleteEquipo({
  query,
  setQuery,
  minLength = 3,
  sourceRef,
}) {
  const { equipos, buscarEquipos, buscarEquipoPorId } = useEquipos();

  const [isOpen, setIsOpen] = useState(false);
  const isSelecting = useRef(false);
  const ignoreDebounce = useRef(false);

  /*───────────────────────────────────────────────
    Debounced search (solo intención usuario)
  ───────────────────────────────────────────────*/
  useEffect(() => {
    if (sourceRef?.current === 'hydrate') {
      sourceRef.current = null;
      return;
    }

    if (ignoreDebounce.current || isSelecting.current) {
      ignoreDebounce.current = false;
      return;
    }

    const q = query.trim();
    if (!q || q.length < minLength) return;

    const timeout = setTimeout(async () => {
      await buscarEquipos(q);
      setIsOpen(true);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, minLength, buscarEquipos, sourceRef]);

  /*───────────────────────────────────────────────
    Selección de equipo existente
  ───────────────────────────────────────────────*/
  const seleccionarEquipo = async (e) => {
    if (!e?._id) return;

    isSelecting.current = true;
    ignoreDebounce.current = true;

    setQuery(e.nroSerie ?? '');
    setIsOpen(false);

    const full = await buscarEquipoPorId(e._id);

    isSelecting.current = false;

    return full ?? e;
  };

  return {
    resultados: equipos,
    isOpen,
    abrirResultados: () => setIsOpen(true),
    cerrarResultados: () => setTimeout(() => setIsOpen(false), 150),
    seleccionarEquipo,
  };
}
