// AutocompleteBase.jsx
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import closeIcon from '../../assets/form-ingreso/close.svg';

export function AutocompleteBase({
  label,
  placeholder,
  query,
  onChange,
  onToggle,
  isOpen,
  resultados,
  onSelect,
  cerrarResultados,
  renderItem,
  inputName,
  onFocus,
  renderIcon,
  disabled = false, // 👈 NUEVO
}) {
  const showClear = Boolean(query?.trim()) && !disabled;
  const blurTimeout = useRef(null);
  const items = resultados ?? [];

  useEffect(() => {
    return () => blurTimeout.current && clearTimeout(blurTimeout.current);
  }, []);

  return (
    <div className={`col autocomplete-container ${disabled ? 'disabled' : ''}`}>
      {label && <label htmlFor={inputName}>{label}</label>}

      <div className="autocomplete-wrapper">
        <div
          className={`autocomplete-input-wrapper ${
            disabled ? 'autocomplete-disabled' : ''
          }`}
        >
          <input
            id={inputName}
            name={inputName}
            type="text"
            className="input-field autocomplete-input"
            value={query}
            onChange={(e) => !disabled && onChange(e.target.value)}
            onBlur={() => {
              if (disabled) return;
              blurTimeout.current = setTimeout(() => cerrarResultados?.(), 150);
            }}
            onFocus={() => {
              if (disabled) return;
              if (blurTimeout.current) {
                clearTimeout(blurTimeout.current);
                blurTimeout.current = null;
              }
              onFocus?.();
            }}
            onClick={() => !disabled && !isOpen && onToggle()}
            autoComplete="off"
            placeholder={placeholder}
            disabled={disabled} // 👈 BLOQUEO DE INPUT
          />

          {/* iconos */}
          <div className="autocomplete-actions">
            {showClear && (
              <button
                className="autocomplete-clear"
                type="button"
                onMouseDown={(e) => {
                  if (disabled) return;
                  e.preventDefault();
                  onChange('');
                  onFocus?.();
                }}
              >
                <img src={closeIcon} alt="close" />
              </button>
            )}

            <button
              type="button"
              className="autocomplete-toggle"
              disabled={disabled}
              onMouseDown={(e) => {
                if (disabled) return;
                e.preventDefault();
                onToggle();
              }}
            >
              {renderIcon?.({ isOpen }) ?? null}
            </button>
          </div>
        </div>

        {/* lista bloqueada */}
        {isOpen && !disabled && items.length > 0 && (
          <div className="autocomplete-list" role="listbox">
            {items.map((item) => (
              <div
                key={item._id || item.id || item.nombre}
                className="autocomplete-item"
                role="option"
                onMouseDown={() => !disabled && onSelect(item)}
              >
                {renderItem ? renderItem(item) : <>{item.nombre}</>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

AutocompleteBase.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
  query: PropTypes.string,
  onChange: PropTypes.func,
  onToggle: PropTypes.func,
  resultados: PropTypes.array,
  isOpen: PropTypes.bool,
  onSelect: PropTypes.func,
  cerrarResultados: PropTypes.func,
  renderItem: PropTypes.func,
  inputName: PropTypes.string,
  onFocus: PropTypes.func,
  renderIcon: PropTypes.func, // 👈 nuevo
};
