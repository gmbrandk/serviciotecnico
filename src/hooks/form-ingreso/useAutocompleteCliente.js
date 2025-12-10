import { useClientes } from '@context/form-ingreso/clientesContext';
import { useEffect, useRef, useState } from 'react';

const EMPTY = {
  _id: null,
  dni: '',
  nombres: '',
  apellidos: '',
  telefono: '',
  email: '',
  direccion: '',
};

export function useAutocompleteCliente(initialData = null, minLength = 3) {
  const { clientes, buscarClientes, buscarClientePorId } = useClientes();

  // Estado
  const [query, setQuery] = useState('');
  const [selectedCliente, setSelectedCliente] = useState(EMPTY);
  const [isOpen, setIsOpen] = useState(false);

  // Flags
  const isSelecting = useRef(false); // selección manual
  const isExternalUpdate = useRef(false); // update desde provider
  const prevInitialRef = useRef(null); // evita loops de sincronización
  const ignoreDebounce = useRef(true); // evita buscar al cargar

  // ============================================================
  // 1. SYNC PROVIDER → componente (sin loops)
  // ============================================================
  useEffect(() => {
    // Si el provider no envía nada → limpiar una sola vez
    if (!initialData) {
      if (selectedCliente._id !== null || query !== '') {
        setSelectedCliente(EMPTY);
        setQuery('');
      }
      prevInitialRef.current = null;
      return;
    }

    // Evitar loops: si no cambió realmente, NO hacer nada
    const same =
      JSON.stringify(initialData) === JSON.stringify(prevInitialRef.current);

    if (same) return;

    prevInitialRef.current = initialData;
    isExternalUpdate.current = true;

    setSelectedCliente(initialData);
    setQuery(initialData.dni || '');
    setIsOpen(false);

    // detener la búsqueda automática después de sync
    ignoreDebounce.current = true;
  }, [initialData]); // 👈 NO depende de selectedCliente ni de query

  // ============================================================
  // 2. Debounced buscarClientes (sin loops)
  // ============================================================
  useEffect(() => {
    if (isSelecting.current) return;
    if (isExternalUpdate.current) return;
    if (ignoreDebounce.current) {
      ignoreDebounce.current = false;
      return;
    }

    const dni = (query || '').trim();
    if (!dni || dni.length < minLength) {
      return;
    }

    const timeout = setTimeout(() => {
      buscarClientes(dni);
      setIsOpen(true);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, minLength, buscarClientes]);

  // ============================================================
  // 3. Seleccionar cliente (lookup completo)
  // ============================================================
  const seleccionarCliente = async (c) => {
    isSelecting.current = true;
    isExternalUpdate.current = false;
    ignoreDebounce.current = true;

    setQuery(c.dni || '');
    setIsOpen(false);

    try {
      const full = await buscarClientePorId(c._id);
      setSelectedCliente(full || c);
    } catch (err) {
      console.error('useAutocompleteCliente → buscarClientePorId error', err);
      setSelectedCliente(c);
    }

    setTimeout(() => {
      isSelecting.current = false;
    }, 50);
  };

  // ============================================================
  // 4. INPUT CHANGE (del usuario)
  // ============================================================
  const onQueryChange = (value) => {
    if (isExternalUpdate.current) {
      // viene del provider → no abrir dropdown
      isExternalUpdate.current = false;
      setQuery(value);
      return;
    }

    ignoreDebounce.current = false;
    setQuery(value);
    setSelectedCliente(EMPTY);

    if (!isSelecting.current) {
      setIsOpen(true);
    }
  };

  // ============================================================
  // API pública
  // ============================================================
  return {
    query,
    resultados: clientes,
    selectedCliente,

    onQueryChange,
    seleccionarCliente,

    isOpen,
    abrirResultados: () => {
      ignoreDebounce.current = false;
      setIsOpen(true);
    },
    cerrarResultados: () => {
      setTimeout(() => setIsOpen(false), 150);
    },

    setSelectedCliente,
  };
}
