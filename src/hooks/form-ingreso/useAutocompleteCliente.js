// hooks/form-ingreso/useAutocompleteCliente.js
import { useEffect, useRef, useState } from 'react';
import { useClientes } from '@context/form-ingreso/clientesContext';

const EMPTY_CLIENT = {
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
  const [query, setQuery] = useState(initialData?.dni || '');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(
    initialData || EMPTY_CLIENT
  );

  // Flags internos
  const isSelecting = useRef(false);
  const loadedInitially = useRef(true); // 👈 controla si el query vino de carga inicial

  // ===========================
  // Sync initialData (cierre y marca de carga inicial)
  // ===========================
  useEffect(() => {
    if (initialData) {
      setSelectedCliente(initialData);
      setQuery(initialData.dni || '');
      setIsOpen(false);
      loadedInitially.current = true; // carga inicial → NO abrir autocomplete
    } else {
      setSelectedCliente(EMPTY_CLIENT);
      setQuery('');
      setIsOpen(false);
      loadedInitially.current = false; // sin carga inicial → comportamiento normal
    }
  }, [initialData]);

  // ===========================
  // Debounce autocomplete
  // ===========================
  useEffect(() => {
    // No buscar mientras se selecciona un cliente
    if (isSelecting.current) return;

    // Si no hay query suficiente, limpiar y no abrir lista
    if (!query || query.trim().length < minLength) {
      setSelectedCliente(EMPTY_CLIENT);
      return;
    }

    const timeout = setTimeout(() => {
      buscarClientes(query);

      // 👇 FIX: solo abrir si el usuario escribió manualmente
      if (!loadedInitially.current) {
        setIsOpen(true);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [query, buscarClientes, minLength]);

  // ===========================
  // Select client (full lookup)
  // ===========================
  const seleccionarCliente = async (clienteParcial) => {
    isSelecting.current = true;
    loadedInitially.current = false; // desde aquí, el usuario tomó control

    setQuery(clienteParcial.dni || '');
    setIsOpen(false);

    const fullData = await buscarClientePorId(clienteParcial._id);

    if (fullData) setSelectedCliente(fullData);
    else setSelectedCliente(clienteParcial);

    // Liberar bloqueo de selección
    setTimeout(() => {
      isSelecting.current = false;
    }, 100);
  };

  // ===========================
  // UI handlers
  // ===========================
  const onQueryChange = (value) => {
    loadedInitially.current = false; // 👉 usuario está escribiendo
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
    resultados: clientes,
    selectedCliente,
    seleccionarCliente,
    isOpen,
    onQueryChange,
    abrirResultados,
    cerrarResultados,
    setSelectedCliente,
  };
}
