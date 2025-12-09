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

  // Estado principal
  const [query, setQuery] = useState('');
  const [selectedCliente, setSelectedCliente] = useState(EMPTY);
  const [isOpen, setIsOpen] = useState(false);

  // Flags internos
  const isSelecting = useRef(false);
  const isInitialLoad = useRef(true); // protege el debounce en la carga inicial

  // ============================================================
  // SYNC provider → hook
  // ============================================================
  useEffect(() => {
    const initialId = initialData?._id ?? null;
    const currentId = selectedCliente?._id ?? null;

    console.debug('🟦 useAutocompleteCliente: SYNC effect triggered', {
      initialId,
      currentId,
      isOpen,
    });

    if (!initialData) {
      // Solo limpiar si actualmente había un cliente seleccionado
      if (currentId !== null) {
        console.info(
          '🟦 useAutocompleteCliente: initialData es null, limpiando selección actual'
        );
        setSelectedCliente(EMPTY);
        setQuery('');
      }
      isInitialLoad.current = false;
      return;
    }

    if (initialId !== currentId) {
      console.info(
        '🟦 useAutocompleteCliente: incoming initialData difiere, actualizando seleccionado',
        { incomingId: initialId }
      );
      setSelectedCliente(initialData);
      setQuery(initialData.dni || '');
    } else {
      console.debug(
        '🟦 useAutocompleteCliente: incoming initialData igual al current, no se actualiza'
      );
    }

    // cerrar dropdown por si estaba abierto
    if (isOpen) {
      console.debug(
        '🟦 useAutocompleteCliente: cerrando dropdown por sincronización inicial'
      );
      setIsOpen(false);
    }
    // marcamos esta llegada como carga inicial para evitar abrir dropdown por debounce
    isInitialLoad.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, selectedCliente]);

  // ============================================================
  // Debounced búsqueda (NO ejecuta durante carga inicial ni selección)
  // ============================================================
  useEffect(() => {
    console.debug('🟦 useAutocompleteCliente: debounce effect fired', {
      query,
      isSelecting: isSelecting.current,
      isInitialLoad: isInitialLoad.current,
    });

    if (isSelecting.current) {
      console.debug(
        '🟦 useAutocompleteCliente: se ignora debounce por isSelecting=true'
      );
      return;
    }
    if (isInitialLoad.current) {
      console.debug(
        '🟦 useAutocompleteCliente: se ignora debounce por carga inicial'
      );
      return;
    }
    if (!query || query.trim().length < minLength) {
      console.debug(
        '🟦 useAutocompleteCliente: query demasiado corto o vacío, no buscar',
        { queryLength: (query || '').length, minLength }
      );
      return;
    }

    const timeout = setTimeout(() => {
      console.info(
        '🟦 useAutocompleteCliente: realizando buscarClientes para query',
        query.trim()
      );
      buscarClientes(query.trim());
      setIsOpen(true);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, minLength, buscarClientes]);

  // ============================================================
  // Seleccionar cliente (lookup completo)
  // ============================================================
  const seleccionarCliente = async (c) => {
    console.info(
      '🟦 useAutocompleteCliente: seleccionarCliente llamado para',
      c?._id
    );
    isSelecting.current = true;
    isInitialLoad.current = false;

    setQuery(c.dni || '');
    setIsOpen(false);

    try {
      const full = await buscarClientePorId(c._id);
      console.debug(
        '🟦 useAutocompleteCliente: buscarClientePorId result',
        full ? full._id ?? full?.data?._id : null
      );
      setSelectedCliente(full || c);
    } catch (e) {
      console.error(
        '🟦 useAutocompleteCliente: error al buscar cliente por id',
        e
      );
      setSelectedCliente(c);
    }

    setTimeout(() => (isSelecting.current = false), 80);
  };

  // ============================================================
  // Handlers UI
  // ============================================================
  const onQueryChange = (v) => {
    isInitialLoad.current = false;
    console.debug('🟦 useAutocompleteCliente: onQueryChange', v);
    setQuery(v);
    setIsOpen(true);
  };

  return {
    query,
    resultados: clientes,
    selectedCliente,
    seleccionarCliente,
    isOpen,
    onQueryChange,
    abrirResultados: () => {
      isInitialLoad.current = false;
      setIsOpen(true);
    },
    cerrarResultados: () => setTimeout(() => setIsOpen(false), 150),
    setSelectedCliente,
  };
}
