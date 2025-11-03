import { useMemo, useState } from 'react';

export function useAutocomplete({
  suggestions = [],
  value,
  showDropdown = false,
}) {
  const [internalFocus, setInternalFocus] = useState(false);
  const [manualToggle, setManualToggle] = useState(false);

  // Evita duplicados en las sugerencias
  const uniqueSuggestions = useMemo(() => {
    return suggestions.filter(
      (s, i, arr) =>
        i ===
        arr.findIndex((t) => {
          if (typeof s === 'string' && typeof t === 'string') return t === s;
          return t._id ? t._id === s._id : t.label === s.label;
        })
    );
  }, [suggestions]);

  // Determina cuándo mostrar el dropdown
  const shouldShowDropdown =
    (showDropdown || manualToggle) &&
    uniqueSuggestions.length > 0 &&
    internalFocus;

  // Valor de texto mostrado
  const displayValue =
    typeof value === 'object' && value !== null
      ? value.label || value.codigo || ''
      : value || '';

  const handleFocus = (e, onFocus) => {
    setInternalFocus(true);
    onFocus?.(e);
  };

  const handleBlur = (e, onBlur) => {
    setTimeout(() => setInternalFocus(false), 150);
    onBlur?.(e);
    setManualToggle(false);
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    setManualToggle((prev) => !prev);
    setInternalFocus(true);
  };

  const closeDropdown = () => setManualToggle(false);

  return {
    internalFocus,
    manualToggle,
    uniqueSuggestions,
    shouldShowDropdown,
    displayValue,
    handleFocus,
    handleBlur,
    toggleDropdown,
    closeDropdown,
  };
}
