import { useEquipos } from '@context/form-ingreso/equiposContext';
import { useEffect, useRef, useState } from 'react';

/* ============================================================
   LOG infra
============================================================ */
let __LOG_SEQ__ = 0;
const log = (tag, who, why, payload = {}) => {
  __LOG_SEQ__ += 1;
  console.log(
    `%c[${__LOG_SEQ__}] ${tag} | ${who} | ${why}`,
    'color:#6cf;font-weight:bold',
    payload
  );
};

/* ============================================================
   Normalización canónica (BACKEND → UI FORM SHAPE)
============================================================ */
function normalizarEquipo(raw = null) {
  if (!raw) {
    return {
      _id: null,
      nroSerie: '',
      marca: '',
      modelo: '',
      tipo: '',
      sku: '',
      macAddress: '',
      imei: '',
      procesador: '',
      ram: '',
      almacenamiento: '',
      gpu: '',
    };
  }

  const specs = raw.especificacionesActuales ?? {};

  return {
    _id: raw._id ?? null,
    nroSerie: raw.nroSerie ?? '',
    marca: raw.marca ?? '',
    modelo: raw.modelo ?? '',
    tipo: raw.tipo ?? '',
    sku: raw.sku ?? '',
    macAddress: raw.macAddress ?? '',
    imei: raw.imei ?? '',

    // 🔥 APLANADO CORRECTO DESDE BACKEND
    procesador: specs.cpu?.valor ?? '',
    ram: specs.ram?.valor ?? '',
    almacenamiento: specs.almacenamiento?.valor ?? '',
    gpu: specs.gpu?.valor ?? '',
  };
}

const EMPTY = normalizarEquipo(null);

export function useAutocompleteEquipo(initial = null, minLength = 3) {
  const { equipos, buscarEquipos, buscarEquipoPorId } = useEquipos();

  const [query, setQuery] = useState('');
  const [selectedEquipo, setSelectedEquipo] = useState(EMPTY);
  const [isOpen, setIsOpen] = useState(false);

  // Flags internos (NO render)
  const isSelecting = useRef(false);
  const isExternalUpdate = useRef(false);
  const prevInitialRef = useRef(null);
  const ignoreDebounce = useRef(true);

  /* ============================================================
     1. SYNC provider → hook (ÚNICO punto de entrada)
  ============================================================ */
  useEffect(() => {
    const normalized = initial ? normalizarEquipo(initial) : null;

    log('INITIAL', 'EFFECT', 'sync-from-provider:start', {
      initial,
      prevInitial: prevInitialRef.current,
      query,
      selectedEquipo,
    });

    if (!normalized) {
      if (selectedEquipo._id !== null || query !== '') {
        log('RESET', 'EFFECT', 'empty-initial');
        setSelectedEquipo(EMPTY);
        setQuery('');
      }
      prevInitialRef.current = null;
      return;
    }

    const same =
      JSON.stringify(normalized) === JSON.stringify(prevInitialRef.current);

    if (same) {
      log('INITIAL', 'EFFECT', 'same-initial-skip');
      return;
    }

    prevInitialRef.current = normalized;
    isExternalUpdate.current = true;

    log('SELECTED', 'EFFECT', 'set-from-initial', {
      id: normalized._id,
      nroSerie: normalized.nroSerie,
    });

    setSelectedEquipo((prev) => {
      const merged = {
        ...prev,
        ...normalized,

        // ⛑️ proteger specs ya cargadas
        procesador: normalized.procesador || prev.procesador,
        ram: normalized.ram || prev.ram,
        almacenamiento: normalized.almacenamiento || prev.almacenamiento,
        gpu: normalized.gpu || prev.gpu,
      };

      log('SELECTED', 'EFFECT', 'merge-from-initial', {
        prev: {
          procesador: prev.procesador,
          ram: prev.ram,
        },
        next: {
          procesador: merged.procesador,
          ram: merged.ram,
        },
      });

      return merged;
    });

    setQuery(normalized.nroSerie || '');
    setIsOpen(false);

    ignoreDebounce.current = true;
  }, [initial]);

  /* ============================================================
     2. Debounced search (SOLO input de usuario)
  ============================================================ */
  useEffect(() => {
    if (isSelecting.current) return;
    if (isExternalUpdate.current) return;

    if (ignoreDebounce.current) {
      ignoreDebounce.current = false;
      return;
    }

    const q = (query || '').trim();
    if (!q || q.length < minLength) return;

    log('QUERY', 'EFFECT', 'debounce:scheduled', { q });

    const timeout = setTimeout(() => {
      log('QUERY', 'EFFECT', 'debounce:fire', { q });
      buscarEquipos(q);
      setIsOpen(true);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, minLength, buscarEquipos]);

  /* ============================================================
     3. Selección semántica (lookup + normalización)
  ============================================================ */
  const seleccionarEquipo = async (e) => {
    log('FLOW', 'UI', 'select:start', {
      id: e?._id,
      nroSerie: e?.nroSerie,
    });

    isSelecting.current = true;
    isExternalUpdate.current = false;
    ignoreDebounce.current = true;

    setQuery(e.nroSerie || '');
    setIsOpen(false);

    try {
      const full = await buscarEquipoPorId(e._id);
      log('SELECTED', 'HOOK', 'select:full', {
        id: full?._id ?? e._id,
      });
      setSelectedEquipo(normalizarEquipo(full || e));
    } catch {
      log('SELECTED', 'HOOK', 'select:fallback');
      setSelectedEquipo(normalizarEquipo(e));
    }

    setTimeout(() => {
      isSelecting.current = false;
      log('FLOW', 'HOOK', 'select:end');
    }, 80);
  };

  /* ============================================================
     4. Input del usuario
  ============================================================ */
  const onQueryChange = (value) => {
    log('QUERY', 'UI', 'onQueryChange', {
      value,
      isExternalUpdate: isExternalUpdate.current,
    });

    if (isExternalUpdate.current) {
      isExternalUpdate.current = false;
      setQuery(value);
      return;
    }

    ignoreDebounce.current = false;
    setQuery(value);

    log('SELECTED', 'HOOK', 'user-input-clears-selected');
    setSelectedEquipo(EMPTY);

    if (!isSelecting.current) setIsOpen(true);
  };

  /* ============================================================
     API pública
  ============================================================ */
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
  };
}
