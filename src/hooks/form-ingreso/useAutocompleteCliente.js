import { useClientes } from '@context/form-ingreso/clientesContext';
import { useEffect, useRef, useState } from 'react';

// ============================================================
// LOG infra
// ============================================================
let __LOG_SEQ__ = 0;
const log = (tag, who, why, payload = {}) => {
  __LOG_SEQ__ += 1;
  console.log(
    `%c[${__LOG_SEQ__}] ${tag} | ${who} | ${why}`,
    'color:#9f0;font-weight:bold',
    payload
  );
};

// ============================================================
// Normalización canónica
// ============================================================
function normalizarCliente(raw = {}) {
  if (!raw) {
    return {
      _id: null,
      dni: '',
      nombres: '',
      apellidos: '',
      telefono: '',
      email: '',
      direccion: '',
    };
  }

  return {
    _id: raw._id ?? null,
    dni: raw.dni ?? '',
    nombres: raw.nombres ?? '',
    apellidos: raw.apellidos ?? '',
    telefono: raw.telefono ?? '',
    email: raw.email ?? '',
    direccion: raw.direccion ?? '',
  };
}

const EMPTY = normalizarCliente(null);

export function useAutocompleteCliente(initial = null, minLength = 3) {
  const { clientes, buscarClientes, buscarClientePorId } = useClientes();

  const [query, setQuery] = useState('');
  const [selectedCliente, setSelectedCliente] = useState(EMPTY);
  const [isOpen, setIsOpen] = useState(false);

  const isSelecting = useRef(false);
  const isExternalUpdate = useRef(false);
  const prevInitialRef = useRef(null);
  const ignoreDebounce = useRef(true);

  // ============================================================
  // 1. SYNC provider → hook
  // ============================================================
  useEffect(() => {
    const normalized = initial ? normalizarCliente(initial) : null;

    log('INITIAL', 'EFFECT', 'sync-from-provider:start', {
      initial,
      prevInitial: prevInitialRef.current,
      query,
      selectedCliente,
    });

    if (!normalized) {
      if (selectedCliente._id !== null || query !== '') {
        log('QUERY', 'EFFECT', 'reset-empty-initial', { to: '' });
        log('SELECTED', 'EFFECT', 'reset-empty-initial', { to: EMPTY });

        setSelectedCliente(EMPTY);
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

    log('SELECTED', 'EFFECT', 'set-from-initial', { to: normalized });
    log('QUERY', 'EFFECT', 'set-from-initial', {
      to: normalized.dni || '',
    });

    setSelectedCliente(normalized);
    setQuery(normalized.dni || '');
    setIsOpen(false);

    ignoreDebounce.current = true;
  }, [initial]);

  // ============================================================
  // 2. Debounced search (solo usuario)
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

    log('QUERY', 'EFFECT', 'debounce:scheduled', { q });

    const timeout = setTimeout(() => {
      log('QUERY', 'EFFECT', 'debounce:fire', { q });
      buscarClientes(q);
      setIsOpen(true);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, minLength, buscarClientes]);

  // ============================================================
  // 3. Selección semántica
  // ============================================================
  const seleccionarCliente = async (c) => {
    log('FLOW', 'UI', 'select:start', { c });

    isSelecting.current = true;
    isExternalUpdate.current = false;
    ignoreDebounce.current = true;

    log('QUERY', 'HOOK', 'select:set-dni', { to: c.dni });
    setQuery(c.dni || '');
    setIsOpen(false);

    try {
      const full = await buscarClientePorId(c._id);

      log('SELECTED', 'HOOK', 'select:full-client', {
        to: full || c,
      });

      setSelectedCliente(normalizarCliente(full || c));
    } catch (err) {
      log('SELECTED', 'HOOK', 'select:fallback-client', { to: c });
      setSelectedCliente(normalizarCliente(c));
    }

    setTimeout(() => {
      isSelecting.current = false;
      log('FLOW', 'HOOK', 'select:end');
    }, 80);
  };

  // ============================================================
  // 4. Input del usuario
  // ============================================================
  const onQueryChange = (value) => {
    log('QUERY', 'UI', 'onQueryChange:called', {
      value,
      isExternalUpdate: isExternalUpdate.current,
      isSelecting: isSelecting.current,
    });

    if (isExternalUpdate.current) {
      log('QUERY', 'HOOK', 'external-update-branch', { to: value });
      isExternalUpdate.current = false;
      setQuery(value);
      return;
    }

    log('QUERY', 'HOOK', 'user-input-branch', { to: value });

    ignoreDebounce.current = false;
    setQuery(value);

    log('SELECTED', 'HOOK', 'user-input-clears-selected', { to: EMPTY });
    setSelectedCliente(EMPTY);

    if (!isSelecting.current) setIsOpen(true);
  };

  return {
    query,
    resultados: clientes,
    selectedCliente,

    onQueryChange,
    seleccionarCliente,

    isOpen,
    abrirResultados: () => {
      log('FLOW', 'UI', 'open-results');
      ignoreDebounce.current = false;
      setIsOpen(true);
    },
    cerrarResultados: () => {
      log('FLOW', 'UI', 'close-results');
      setTimeout(() => setIsOpen(false), 150);
    },
  };
}
