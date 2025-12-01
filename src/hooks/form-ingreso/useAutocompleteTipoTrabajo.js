import { useEffect, useMemo, useRef, useState } from 'react';
import { useTiposTrabajo } from '@context/form-ingreso/tiposTrabajoContext';
import { log } from '@utils/form-ingreso/log';

export function useAutocompleteTipoTrabajo(initialValue = null) {
  const { tiposTrabajo } = useTiposTrabajo();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTrabajo, setSelectedTrabajo] = useState(null);
  const [isInitialSelection, setIsInitialSelection] = useState(false);

  const initializedRef = useRef(false);

  // ----------------------------------------------
  // Helper para resolver el initialValue
  // ----------------------------------------------
  const resolveInitial = (val) => {
    if (!val) return null;

    // objeto recibido del backend
    if (typeof val === 'object') {
      if (val._id) {
        const found = tiposTrabajo?.find((t) => t._id === val._id);
        return { found: found ?? val, initial: true };
      }

      if (val.nombre) {
        const found = tiposTrabajo?.find(
          (t) =>
            t.nombre.trim().toLowerCase() === val.nombre.trim().toLowerCase()
        );
        return { found: found ?? val, initial: true };
      }

      return null;
    }

    // string → intentar ID o nombre
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (!trimmed) return null;

      const byId = tiposTrabajo?.find((t) => t._id === trimmed);
      if (byId) return { found: byId, initial: true };

      const byName = tiposTrabajo?.find(
        (t) => t.nombre.trim().toLowerCase() === trimmed.toLowerCase()
      );
      if (byName) return { found: byName, initial: true };

      // texto libre
      return { found: { nombre: trimmed }, initial: false };
    }

    return null;
  };

  // ----------------------------------------------
  // Inicialización (una sola vez al montar)
  // ----------------------------------------------
  useEffect(() => {
    setIsOpen(false);
    if (initializedRef.current) return;
    if (!initialValue) return;
    if (!tiposTrabajo?.length) return;

    const resolved = resolveInitial(initialValue);
    if (!resolved) return;

    initializedRef.current = true;

    log('AUTO-TIPO', 'Inicializando desde initialValue', {
      initialValue,
      resolved,
    });

    if (resolved.found?._id) {
      setSelectedTrabajo(resolved.found);
      setQuery(resolved.found.nombre ?? '');
    } else {
      setSelectedTrabajo(null);
      setQuery(resolved.found.nombre);
    }

    setIsInitialSelection(Boolean(resolved.initial));
  }, [initialValue, tiposTrabajo]);

  // ----------------------------------------------
  // Sincronizar cuando tiposTrabajo llega tarde
  // ----------------------------------------------
  useEffect(() => {
    if (!tiposTrabajo?.length) return;
    if (selectedTrabajo?._id) return;
    if (!query) return;

    const lower = query.trim().toLowerCase();

    const found = tiposTrabajo.find(
      (t) => t._id === query || t.nombre.trim().toLowerCase() === lower
    );

    if (found) {
      setSelectedTrabajo(found);
      setIsInitialSelection(true);
    }
  }, [tiposTrabajo, query, selectedTrabajo]);

  // ----------------------------------------------
  // Cuando seleccionamos un trabajo → actualizar query
  // ----------------------------------------------
  useEffect(() => {
    if (selectedTrabajo) {
      setQuery(selectedTrabajo.nombre);
    }
  }, [selectedTrabajo]);

  // ----------------------------------------------
  // Filtrado optimizado
  // ----------------------------------------------
  const resultados = useMemo(() => {
    if (!tiposTrabajo) return [];

    const q = (query ?? '').trim().toLowerCase();

    if (!q) return tiposTrabajo;

    return tiposTrabajo
      .map((item) => {
        const name = item.nombre.toLowerCase();
        let score = 0;

        if (name === q) score = 100;
        else if (name.startsWith(q)) score = 80;
        else if (name.includes(q)) score = 40;

        return { item, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((x) => x.item);
  }, [query, tiposTrabajo]);

  // ----------------------------------------------
  // API
  // ----------------------------------------------
  const abrirResultados = () => setIsOpen(true);
  const cerrarResultados = () => setIsOpen(false);

  const onChange = (value) => {
    setQuery(value);
    setSelectedTrabajo(null);

    // NO abrir si venimos de selección inicial
    if (!isInitialSelection) abrirResultados();

    setIsInitialSelection(false);
  };

  const seleccionarTrabajo = (trabajo) => {
    setSelectedTrabajo(trabajo);
    setQuery(trabajo.nombre);
    setIsInitialSelection(false);
    cerrarResultados();
  };

  return {
    query,
    resultados,
    isOpen,
    selectedTrabajo,
    onChange,
    abrirResultados,
    cerrarResultados,
    seleccionarTrabajo,
    isInitialSelection,
  };
}
