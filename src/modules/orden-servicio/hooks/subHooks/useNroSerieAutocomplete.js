import { useEffect, useRef, useState } from 'react';
import { useRecentStorage } from '../shared/useRecentStorage';

export function useNroSerieAutocomplete({
  equipoInicial,
  equipos,
  fetchEquipoById,
  resetEquipoId,
  handleChangeOrden,
  focusNextField,
}) {
  const [nroSerieBusqueda, setNroSerieBusqueda] = useState(
    equipoInicial?.nroSerie || ''
  );
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [cacheEquipos, setCacheEquipos] = useState([]);
  const [manualClose, setManualClose] = useState(false);
  const [isFirstFocus, setIsFirstFocus] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  const userInitiatedRef = useRef(false);

  // recientes usando hook genérico
  const { items: recentEquipos, addItem: saveRecentEquipo } = useRecentStorage(
    'recentEquipos',
    10
  );

  // cache de API
  useEffect(() => {
    if (equipos?.length > 0) {
      setCacheEquipos(equipos);
    }
  }, [equipos]);

  // recomputar sugerencias
  useEffect(() => {
    if (manualClose) return;
    const term = nroSerieBusqueda?.trim();

    if (!term) {
      if (userInitiatedRef.current && recentEquipos.length > 0) {
        setSuggestions(recentEquipos);
        setShowDropdown(true);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    } else if (term.length >= 4) {
      setSuggestions(equipos);
      setShowDropdown((equipos?.length || 0) > 0);
    } else if (term.length > 0 && term.length < 4) {
      const combined = [...(cacheEquipos || []), ...(recentEquipos || [])];
      const filtered = combined.filter(
        (e) => e.nroSerie && e.nroSerie.startsWith(term.toUpperCase())
      );
      setSuggestions(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }

    setActiveIndex(-1);
  }, [nroSerieBusqueda, equipos, recentEquipos, cacheEquipos, manualClose]);

  // Handlers
  const handleNroSerieChange = (e) => {
    const nuevo = e.target.value.toUpperCase();

    if (equipoInicial.nroSerie !== nuevo) {
      resetEquipoId();
      handleChangeOrden('equipo', {
        _id: undefined,
        nroSerie: nuevo,
        tipo: '',
        marca: '',
        modelo: '',
        sku: '',
        macAddress: '',
        imei: '',
        estado: '',
      });
    } else {
      handleChangeOrden('equipo', { ...equipoInicial, nroSerie: nuevo });
    }

    setNroSerieBusqueda(nuevo);
    setManualClose(false);
  };

  const handleNroSeriePointerDown = () => {
    userInitiatedRef.current = true;
    setIsFirstFocus(false);
    setManualClose(false);
  };

  const handleNroSerieFocus = () => {
    if (isFirstFocus && !userInitiatedRef.current) {
      setIsFirstFocus(false);
      return;
    }
    userInitiatedRef.current = false;

    if (nroSerieBusqueda.trim().length === 0 && recentEquipos.length > 0) {
      setSuggestions(recentEquipos);
      setShowDropdown(true);
    } else if (suggestions.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleNroSerieBlur = () => {
    setShowDropdown(false);
    setActiveIndex(-1);
  };

  const handleSelectEquipo = async (eq) => {
    try {
      const fullEquipo = await fetchEquipoById(eq._id);
      const equipoFinal = {
        _id: fullEquipo?._id || eq._id,
        nroSerie: fullEquipo?.nroSerie || eq.nroSerie,
        tipo: fullEquipo?.tipo || '',
        marca: fullEquipo?.marca || '',
        modelo: fullEquipo?.modelo || '',
        sku: fullEquipo?.sku || '',
        macAddress: fullEquipo?.macAddress || '',
        imei: fullEquipo?.imei || '',
        estado: fullEquipo?.estado || '',
      };

      handleChangeOrden('equipo', equipoFinal);
      saveRecentEquipo(equipoFinal);

      setShowDropdown(false);
      setActiveIndex(-1);
      setNroSerieBusqueda(equipoFinal.nroSerie);
      setManualClose(true);
    } catch (err) {
      console.error('[handleSelectEquipo] error fetching equipo:', err);
    }
  };

  const handleKeyDownNroSerie = (e) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === 'Enter' && nroSerieBusqueda.length >= 4) {
        e.preventDefault();
        focusNextField('nroSerie');
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
        handleSelectEquipo(suggestions[activeIndex]);
      } else if (nroSerieBusqueda.length >= 4) {
        focusNextField('nroSerie');
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setActiveIndex(-1);
    }
  };

  return {
    state: { nroSerieBusqueda, suggestions, activeIndex, showDropdown },
    handlers: {
      handleNroSerieChange,
      handleNroSeriePointerDown,
      handleNroSerieFocus,
      handleNroSerieBlur,
      handleSelectEquipo,
      handleKeyDownNroSerie,
      focusNextField,
    },
  };
}
