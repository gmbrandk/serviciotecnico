import { useState } from 'react';

export function AutocompleteField({
  id,
  label,
  placeholder,
  value,
  suggestions = [],
  showDropdown = false, // ← viene del padre (puede ser controlado externamente)
  activeIndex = -1,
  disabled = false,
  gridColumn = '1 / 4',
  onChange,
  onSelect,
  onKeyDown,
  onPointerDown,
  onFocus,
  onBlur,
  inputMode,
  maxLength,
  renderSuggestion,
  inputRef,
  withToggle = false, // 👈 si tiene botón desplegable
}) {
  // Estado de enfoque interno del input
  const [internalFocus, setInternalFocus] = useState(false);

  // Estado local del toggle manual (flechita)
  const [manualToggle, setManualToggle] = useState(false);

  // Evita duplicados en las sugerencias
  const uniqueSuggestions = suggestions.filter(
    (s, i, arr) =>
      i ===
      arr.findIndex((t) => {
        if (typeof s === 'string' && typeof t === 'string') return t === s;
        return t._id ? t._id === s._id : t.label === s.label;
      })
  );

  // Si el valor es objeto, muestra una propiedad legible
  const displayValue =
    typeof value === 'object' && value !== null
      ? value.label || value.codigo || ''
      : value || '';

  // Condición unificada: cuándo mostrar el dropdown
  const shouldShowDropdown =
    (showDropdown || manualToggle) &&
    uniqueSuggestions.length > 0 &&
    internalFocus;

  return (
    <div
      className="autocomplete-wrapper"
      style={{ gridColumn, position: 'relative' }}
    >
      {label && (
        <label htmlFor={id} className={label?.className}>
          {label?.name || label}
        </label>
      )}

      <div className="autocomplete-input-wrapper">
        <input
          id={id}
          name={id}
          type="text"
          placeholder={placeholder}
          value={displayValue}
          disabled={disabled}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onFocus={(e) => {
            setInternalFocus(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setTimeout(() => setInternalFocus(false), 150);
            onBlur?.(e);
            // Cierra el menú si pierde foco y no fue por toggle
            setManualToggle(false);
          }}
          autoComplete="off"
          inputMode={inputMode}
          maxLength={maxLength}
          aria-autocomplete="list"
          aria-controls={`${id}-listbox`}
          aria-expanded={shouldShowDropdown}
          className="autocomplete-input"
          ref={inputRef}
        />

        {/* 🔽 Botón con la flecha */}
        {withToggle && (
          <button
            type="button"
            className={`autocomplete-toggle ${
              shouldShowDropdown ? 'open' : ''
            }`}
            onMouseDown={(e) => {
              e.preventDefault(); // evita que el input pierda foco
              setManualToggle((prev) => !prev); // alterna abierto/cerrado
              setInternalFocus(true); // mantiene el foco virtual
            }}
          >
            <img src="/dropdown-arrow.svg" alt="abrir opciones" />
          </button>
        )}
      </div>

      {/* 🔽 Dropdown de sugerencias */}
      {shouldShowDropdown && (
        <ul id={`${id}-listbox`} role="listbox" className="autocomplete-list">
          {uniqueSuggestions.map((s, index) => {
            const isActive = activeIndex === index;
            return (
              <li
                key={s._id || `${id}-${index}`}
                role="option"
                aria-selected={isActive}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect?.(s);
                  setManualToggle(false); // ✅ cierra el dropdown al seleccionar
                }}
                className={`autocomplete-item ${isActive ? 'active' : ''}`}
              >
                {renderSuggestion ? (
                  renderSuggestion(s)
                ) : (
                  <span>{s.label || String(s)}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
