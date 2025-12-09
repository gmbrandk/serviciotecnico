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

// ====== LOG HELPER (centralizado para consistencia) ======
function log(name, event, data = {}) {
  console.debug(`🟣 [ACB:${name}] ${event}`, data);
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
  const blurTimeout = useRef(null);
  const items = resultados ?? [];
  const showClear = Boolean(query?.trim()) && !disabled;

  // ====== LOG: RENDER ======
  log(inputName, 'RENDER', {
    query,
    isOpen,
    disabled,
    itemsCount: items.length,
    showClear,
  });

  useEffect(() => {
    log(inputName, 'MOUNT');
    return () => {
      log(inputName, 'UNMOUNT');
      if (blurTimeout.current) {
        log(inputName, 'cleanup → clearing blurTimeout');
        clearTimeout(blurTimeout.current);
      }
    };
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
          {/* INPUT */}
          <input
            id={inputName}
            name={inputName}
            type="text"
            className={autocompleteStyles.autocompleteInput}
            value={query}
            placeholder={placeholder}
            autoComplete="off"
            disabled={disabled}
            onChange={(e) => {
              if (disabled) {
                log(inputName, 'onChange → IGNORADO porque está disabled');
                return;
              }
              log(inputName, 'onChange', { value: e.target.value });
              onChange(e.target.value);
            }}
            onFocus={(e) => {
              if (disabled) {
                log(inputName, 'onFocus → IGNORADO porque está disabled');
                return;
              }
              if (blurTimeout.current) {
                log(inputName, 'onFocus → clearing blurTimeout');
                clearTimeout(blurTimeout.current);
              }
              log(inputName, 'onFocus');
              onFocus?.(e);
            }}
            onBlur={() => {
              if (disabled) {
                log(inputName, 'onBlur → IGNORADO porque está disabled');
                return;
              }

              log(inputName, 'onBlur → programando cerrarResultados (150ms)');

              blurTimeout.current = setTimeout(() => {
                log(inputName, 'blurTimeout → ejecutar cerrarResultados');
                cerrarResultados?.();
              }, 150);
            }}
            onClick={(e) => {
              if (disabled) {
                log(inputName, 'onClick → IGNORADO porque disabled');
                return;
              }
              if (!isOpen) {
                log(inputName, 'onClick → toggle porque isOpen=false');
                onToggle();
              } else {
                log(inputName, 'onClick → IGNORADO porque isOpen=true');
              }
            }}
          />

          {/* ICONOS */}
          <div className={autocompleteStyles.autocompleteActions}>
            {/* CLEAR BUTTON */}
            {showClear && (
              <button
                type="button"
                className={autocompleteStyles.autocompleteClear}
                onMouseDown={(e) => {
                  if (disabled) {
                    log(
                      inputName,
                      'clear.onMouseDown → IGNORADO porque disabled'
                    );
                    return;
                  }
                  e.preventDefault();
                  log(inputName, 'clear.onMouseDown → clearing query');
                  onChange('');
                  onFocus?.();
                }}
              >
                <img
                  src={closeIcon}
                  alt="clear"
                  className={autocompleteStyles.autocompleteClearIcon}
                />
              </button>
            )}

            {/* TOGGLE BUTTON */}
            <button
              type="button"
              className={autocompleteStyles.autocompleteToggle}
              disabled={disabled}
              onMouseDown={(e) => {
                if (disabled) {
                  log(
                    inputName,
                    'toggle.onMouseDown → IGNORADO porque disabled'
                  );
                  return;
                }
                e.preventDefault();
                log(inputName, 'toggle.onMouseDown → toggle');
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
                onMouseDown={() => {
                  log(inputName, 'onSelect(item)', {
                    id: item._id ?? null,
                    nombre: item.nombre,
                  });
                  onSelect(item);
                }}
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
