import { useEffect, useRef, useState } from 'react';
import { useRecentStorage } from '../shared/useRecentStorage';

export function useDniAutocomplete({
  clienteInicial,
  clientes,
  fetchClienteById,
  resetClienteId,
  handleChangeOrden,
  focusNextField,
}) {
  const [dniBusqueda, setDniBusqueda] = useState(clienteInicial?.dni || '');
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [cacheClientes, setCacheClientes] = useState([]);
  const [manualClose, setManualClose] = useState(false);
  const [isFirstFocus, setIsFirstFocus] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  const userInitiatedRef = useRef(false);

  // recientes usando hook genérico
  const { items: recentClients, addItem: saveRecentClient } = useRecentStorage(
    'recentClients',
    10
  );

  // cache de API
  useEffect(() => {
    if (clientes?.length > 0) {
      setCacheClientes(clientes);
    }
  }, [clientes]);

  // 🔹 recomputar sugerencias
  useEffect(() => {
    if (manualClose) return;
    const term = dniBusqueda?.trim();

    if (!term) {
      if (userInitiatedRef.current && recentClients.length > 0) {
        setSuggestions(recentClients);
        setShowDropdown(true);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    } else if (term.length >= 4) {
      setSuggestions(clientes);
      setShowDropdown((clientes?.length || 0) > 0);
    } else if (term.length > 0 && term.length < 4) {
      const combined = [...(cacheClientes || []), ...(recentClients || [])];
      const filtered = combined.filter((c) => c.dni && c.dni.startsWith(term));
      setSuggestions(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }

    setActiveIndex(-1);
  }, [dniBusqueda, clientes, recentClients, cacheClientes, manualClose]);

  // Handlers
  const handleDniChange = (e) => {
    let nuevoDni = e.target.value.replace(/\D/g, '');
    if (nuevoDni.length > 8) nuevoDni = nuevoDni.slice(0, 8);

    if (clienteInicial.dni !== nuevoDni) {
      resetClienteId();
      handleChangeOrden('cliente', {
        _id: undefined,
        dni: nuevoDni,
        nombres: '',
        apellidos: '',
        telefono: '',
        email: '',
        direccion: '',
      });
    } else {
      handleChangeOrden('cliente', { ...clienteInicial, dni: nuevoDni });
    }

    setDniBusqueda(nuevoDni);
    setManualClose(false);
  };

  const handleDniPointerDown = () => {
    userInitiatedRef.current = true;
    setIsFirstFocus(false);
    setManualClose(false);
  };

  const handleDniFocus = () => {
    if (isFirstFocus && !userInitiatedRef.current) {
      setIsFirstFocus(false);
      return;
    }
    userInitiatedRef.current = false;

    if (dniBusqueda.trim().length === 0 && recentClients.length > 0) {
      setSuggestions(recentClients);
      setShowDropdown(true);
    } else if (suggestions.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleDniBlur = () => {
    setShowDropdown(false);
    setActiveIndex(-1);
  };

  const handleSelectCliente = async (c) => {
    try {
      const fullCliente = await fetchClienteById(c._id);
      const clienteFinal = {
        _id: fullCliente?._id || c._id,
        dni: fullCliente?.dni || c.dni,
        nombres: fullCliente?.nombres || '',
        apellidos: fullCliente?.apellidos || '',
        telefono: fullCliente?.telefono || '',
        email: fullCliente?.email || '',
        direccion: fullCliente?.direccion || '',
      };

      handleChangeOrden('cliente', clienteFinal);
      saveRecentClient(clienteFinal);

      setShowDropdown(false);
      setActiveIndex(-1);
      setDniBusqueda(clienteFinal.dni);
      setManualClose(true);
    } catch (err) {
      console.error('[handleSelectCliente] error fetching cliente:', err);
    }
  };

  const handleKeyDownDni = (e) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === 'Enter' && dniBusqueda.length === 8) {
        e.preventDefault();
        focusNextField('dni');
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        handleSelectCliente(suggestions[activeIndex]);
      } else if (dniBusqueda.length === 8) {
        focusNextField('dni');
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setActiveIndex(-1);
    }
  };

  return {
    state: { dniBusqueda, suggestions, activeIndex, showDropdown },
    handlers: {
      handleDniChange,
      handleDniPointerDown,
      handleDniFocus,
      handleDniBlur,
      handleSelectCliente,
      handleKeyDownDni,
      focusNextField,
    },
  };
}
