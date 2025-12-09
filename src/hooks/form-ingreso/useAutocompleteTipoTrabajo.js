// src/hooks/form-ingreso/useAutocompleteTipoTrabajo.js
import { useTiposTrabajo } from '@context/form-ingreso/tiposTrabajoContext';
import { log } from '@utils/form-ingreso/log';
import { useEffect, useMemo, useRef, useState } from 'react';

export function useAutocompleteTipoTrabajo(initialValue = null) {
  const { tiposTrabajo } = useTiposTrabajo();

  const [query, setQuery] = useState('');
  const [selectedTrabajo, setSelectedTrabajo] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  // Flags internos
  const isSelecting = useRef(false); // usuario seleccionó en dropdown
  const isInitialLoad = useRef(true); // previene apertura inicial automática
  const isExternalUpdate = useRef(false); // provider o initialValue

  // ============================================================
  // Resolver initialValue (fusionado + robusto + claro)
  // ============================================================
  const resolveInitial = (val) => {
    log('TYPE-ACTT:resolveInitial', { val });

    if (!val) return null;

    // Si ya viene como objeto
    if (typeof val === 'object') {
      if (val._id) {
        const found = tiposTrabajo?.find((t) => t._id === val._id);
        return found ?? val;
      }

      if (val.nombre) {
        const normalized = val.nombre.trim().toLowerCase();
        const found = tiposTrabajo?.find(
          (t) => t.nombre.trim().toLowerCase() === normalized
        );
        return found ?? val;
      }

      return null;
    }

    // Si viene como string
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (!trimmed) return null;

      const byId = tiposTrabajo?.find((t) => t._id === trimmed);
      if (byId) return byId;

      const byName = tiposTrabajo?.find(
        (t) => t.nombre.trim().toLowerCase() === trimmed.toLowerCase()
      );
      if (byName) return byName;

      return { nombre: trimmed };
    }

    return null;
  };

  // ============================================================
  // INITIAL VALUE + cambios externos del provider
  // ============================================================
  const prevInitialRef = useRef(null);

  useEffect(() => {
    if (!tiposTrabajo?.length) return;

    // Evitar loops: si initialValue es igual al anterior, NO hacer nada
    const same =
      JSON.stringify(initialValue) === JSON.stringify(prevInitialRef.current);

    if (same) {
      return; // no recalcular, no triggers, no loops
    }

    prevInitialRef.current = initialValue;

    const resolved = resolveInitial(initialValue);

    isExternalUpdate.current = true;

    if (!resolved) {
      if (selectedTrabajo !== null || query !== '') {
        setSelectedTrabajo(null);
        setQuery('');
      }
      return;
    }

    setSelectedTrabajo(resolved);
    setQuery(resolved.nombre || '');
    setIsOpen(false);
  }, [initialValue, tiposTrabajo]);

  // ============================================================
  // INPUT CHANGE
  // ============================================================
  const onChange = (value) => {
    log('TYPE-ACTT:onChange', {
      value,
      isExternalUpdate: isExternalUpdate.current,
      isSelecting: isSelecting.current,
      isInitialLoad: isInitialLoad.current,
    });

    // si viene de initialValue o provider: NO abrir dropdown
    if (isExternalUpdate.current) {
      log('TYPE-ACTT:onChange → external update, no dropdown');
      isExternalUpdate.current = false;
      setQuery(value);
      setSelectedTrabajo(null);
      return;
    }

    // input por usuario
    isInitialLoad.current = false;
    setQuery(value);
    setSelectedTrabajo(null);

    if (!isSelecting.current) {
      log('TYPE-ACTT:onChange → open dropdown');
      setIsOpen(true);
    }
  };

  // ============================================================
  // SELECCIÓN MANUAL
  // ============================================================
  const seleccionarTrabajo = (t) => {
    log('TYPE-ACTT:seleccionarTrabajo', { id: t._id, nombre: t.nombre });

    isSelecting.current = true;
    isInitialLoad.current = false;

    setSelectedTrabajo(t);
    setQuery(t.nombre);
    setIsOpen(false);

    setTimeout(() => {
      isSelecting.current = false;
      log('TYPE-ACTT:seleccionarTrabajo → release lock');
    }, 50);
  };

  // ============================================================
  // FILTRADO FUZZY (fusionado)
  // ============================================================
  const resultados = useMemo(() => {
    log('TYPE-ACTT:resultados.compute', {
      query,
      tiposTrabajoCount: tiposTrabajo?.length,
    });

    if (!tiposTrabajo) return [];

    const q = (query ?? '').trim().toLowerCase();
    if (!q) return tiposTrabajo;

    const ranked = tiposTrabajo
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

    return ranked;
  }, [query, tiposTrabajo]);

  // ============================================================
  // API pública
  // ============================================================
  return {
    query,
    resultados,
    selectedTrabajo,
    isOpen,

    onChange,
    seleccionarTrabajo,

    abrirResultados: () => {
      log('TYPE-ACTT:abrirResultados', {
        isInitialLoad: isInitialLoad.current,
      });
      isInitialLoad.current = false;
      setIsOpen(true);
    },

    cerrarResultados: () => {
      log('TYPE-ACTT:cerrarResultados (150ms)');
      setTimeout(() => {
        setIsOpen(false);
        log('TYPE-ACTT:cerrarResultados → closed');
      }, 150);
    },
  };
}
