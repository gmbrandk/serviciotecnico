// AutocompleteBase.jsx
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import closeIcon from '../../assets/form-ingreso/close.svg';

// Import con airbag
import { autocompleteStyles as rawAutocompleteStyles } from '@styles/form-ingreso';

// Airbag: si viene undefined → objeto vacío
const autocompleteStyles = rawAutocompleteStyles ?? {};

// Helper para clases limpias
function cx(...args) {
  return args.filter(Boolean).join(' ');
}

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
  disabled = false,
}) {
  const showClear = Boolean(query?.trim()) && !disabled;
  const blurTimeout = useRef(null);
  const items = resultados ?? [];

  useEffect(() => {
    return () => blurTimeout.current && clearTimeout(blurTimeout.current);
  }, []);

  return (
    <div
      className={cx(
        'col',
        autocompleteStyles.autocompleteContainer,
        disabled && autocompleteStyles.autocompleteContainerDisabled
      )}
    >
      {label && <label htmlFor={inputName}>{label}</label>}

      <div className={autocompleteStyles.autocompleteWrapper}>
        <div
          className={cx(
            autocompleteStyles.autocompleteInputWrapper,
            disabled && autocompleteStyles.autocompleteDisabled
          )}
        >
          <input
            id={inputName}
            name={inputName}
            type="text"
            className={autocompleteStyles.autocompleteInput}
            value={query}
            onChange={(e) => !disabled && onChange(e.target.value)}
            onBlur={() => {
              if (disabled) return;
              blurTimeout.current = setTimeout(() => cerrarResultados?.(), 150);
            }}
            onFocus={() => {
              if (disabled) return;
              if (blurTimeout.current) clearTimeout(blurTimeout.current);
              onFocus?.();
            }}
            onClick={() => !disabled && !isOpen && onToggle()}
            placeholder={placeholder}
            autoComplete="off"
            disabled={disabled}
          />

          {/* ICONOS */}
          <div className={autocompleteStyles.autocompleteActions}>
            {showClear && (
              <button
                type="button"
                className={autocompleteStyles.autocompleteClear}
                onMouseDown={(e) => {
                  if (disabled) return;
                  e.preventDefault();
                  onChange('');
                  onFocus?.();
                }}
              >
                <img
                  src={closeIcon}
                  alt="close"
                  className={autocompleteStyles.autocompleteClearIcon}
                />
              </button>
            )}

            <button
              type="button"
              className={autocompleteStyles.autocompleteToggle}
              disabled={disabled}
              onMouseDown={(e) => {
                if (disabled) return;
                e.preventDefault();
                onToggle();
              }}
            >
              {renderIcon?.({ isOpen })}
            </button>
          </div>
        </div>

        {/* LISTA */}
        {isOpen && !disabled && items.length > 0 && (
          <div className={autocompleteStyles.autocompleteList} role="listbox">
            {items.map((item) => (
              <div
                key={item._id || item.id || item.nombre}
                className={autocompleteStyles.autocompleteItem}
                role="option"
                onMouseDown={() => onSelect(item)}
              >
                {renderItem ? renderItem(item) : item.nombre}
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
  renderIcon: PropTypes.func,
};
