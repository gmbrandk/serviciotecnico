import { Input } from '../InputBase';
import { useAutocomplete } from './useAutoComplete';

export function AutocompleteField({
  id,
  label,
  placeholder,
  value,
  suggestions = [],
  showDropdown = false,
  activeIndex = -1,
  locked,
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
  withToggle = false,
}) {
  const {
    uniqueSuggestions,
    shouldShowDropdown,
    displayValue,
    handleFocus,
    handleBlur,
    toggleDropdown,
    closeDropdown,
  } = useAutocomplete({ suggestions, value, showDropdown });

  // console.log(
  //   '%c[AutocompleteField] locked →',
  //   'color: orange; font-weight: bold;',
  //   locked
  // );
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
        <Input
          id={id}
          name={id}
          type="text"
          placeholder={placeholder}
          value={displayValue}
          disabled={locked}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onFocus={(e) => handleFocus(e, onFocus)}
          onBlur={(e) => handleBlur(e, onBlur)}
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
            } ${locked ? 'disabled' : ''}`}
            onMouseDown={() => locked && toggleDropdown}
          >
            <img src="/dropdown-arrow.svg" alt="abrir opciones" />
          </button>
        )}
      </div>

      {/* 🔽 Dropdown de sugerencias */}
      {!locked && shouldShowDropdown && (
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
                  closeDropdown();
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
