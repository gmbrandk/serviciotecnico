import { memo, useEffect, useMemo, useState } from 'react';
import { AutocompleteField } from '../fields/AutocompleteField';
import { TelefonoField } from '../fields/TelefonoFIeld';
import { Input } from '../InputBase';
import { SelectField } from './SelectField';

export const SchemaForm = memo(function SchemaForm({
  values = {},
  onChange,
  fields = [],
  gridTemplateColumns = 'repeat(3, 1fr)',
  showDescriptions = true,
  readOnly = false,
  isFallback = false,
  fallbackMessage = '⚙️ Cargando datos...',
  onRetry,
  error = false,
}) {
  // ====================================================
  // 🧱 Seguridad de datos
  // ====================================================
  const safeValues = useMemo(
    () => (values && typeof values === 'object' ? values : {}),
    [values]
  );
  const safeFields = Array.isArray(fields) ? fields : [];

  // ====================================================
  // ⏳ Control visual entre shimmer → error panel
  // ====================================================
  const [showErrorPanel, setShowErrorPanel] = useState(false);

  // ====================================================
  // 🚫 Error de conexión o servidor caído
  // ====================================================
  useEffect(() => {
    let timer;
    // Si estamos cargando o hay error, esperamos antes de mostrar el panel
    if (isFallback || error) {
      timer = setTimeout(() => {
        if (error) setShowErrorPanel(true);
      }, 1500); // ⏱ espera 2.5 segundos antes de mostrar el error
    } else {
      setShowErrorPanel(false);
    }
    return () => clearTimeout(timer);
  }, [error, isFallback]);

  // ====================================================
  // 🚫 Error de conexión o servidor caído
  // ====================================================
  if (showErrorPanel && error) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '260px',
          textAlign: 'center',
          color: '#555',
          background: '#fafafa',
          border: '1px solid #eee',
          borderRadius: '8px',
          padding: '2rem',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            fontSize: '2.5rem',
            marginBottom: '1rem',
            animation: 'pulse 1.5s infinite',
          }}
        >
          📡
        </div>
        <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
          {fallbackMessage || 'No se pudo conectar con el servidor'}
        </p>
        <small style={{ color: '#999' }}>
          Verifica tu conexión a internet o intenta más tarde.
        </small>

        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              marginTop: '1.5rem',
              padding: '10px 18px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              borderRadius: '4px',
              background: '#2980b9',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Reintentar 🔄
          </button>
        )}

        <style>
          {`
            @keyframes pulse {
              0% { opacity: 0.6; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.1); }
              100% { opacity: 0.6; transform: scale(1); }
            }
          `}
        </style>
      </div>
    );
  }
  // ====================================================
  // 🕐 Fallback total (sin campos aún → shimmer global)
  // ====================================================
  if (isFallback && !safeFields.length) {
    return (
      <>
        <style>
          {`
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
          `}
        </style>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns,
            gap: '10px 8px',
            padding: '1rem',
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
            >
              <div
                style={{
                  width: '40%',
                  height: '12px',
                  borderRadius: '3px',
                  background:
                    'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.3s ease-in-out infinite',
                }}
              />
              <div
                style={{
                  height: '38px',
                  borderRadius: '4px',
                  background:
                    'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.3s ease-in-out infinite',
                }}
              />
            </div>
          ))}
        </div>
      </>
    );
  }

  // ====================================================
  // 🚫 Sin campos
  // ====================================================
  if (!safeFields.length) {
    return (
      <p style={{ color: '#999', textAlign: 'center', marginTop: '1rem' }}>
        (Sin campos para mostrar)
      </p>
    );
  }

  // ====================================================
  // ✨ Estilos shimmer (modo carga campo a campo)
  // ====================================================
  const shimmerStyle = {
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.3s ease-in-out infinite',
  };

  const shimmerKeyframes = `
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `;

  // ====================================================
  // 🧠 Funciones auxiliares
  // ====================================================
  const resolveValue = (field, valuesObj) => {
    if (!field || !valuesObj) return field?.defaultValue ?? '';
    const v = valuesObj[field.name];
    const isEmpty = v === undefined || v === null || v === '';
    return isEmpty ? field.defaultValue ?? '' : v;
  };

  const updateValue = (name, newValue) => {
    if (typeof onChange === 'function') {
      const field = safeFields.find((f) => f.name === name);
      const editable = !isFallback || field?.localEditable;
      if (editable) onChange(name, newValue);
    }
  };

  const attachRef = (field, idx) => (el) => {
    if (typeof field.inputRef === 'function') field.inputRef(el);
    else if (field.inputRef && 'current' in field.inputRef)
      field.inputRef.current = el;
  };

  // ====================================================
  // 🧾 Render principal
  // ====================================================
  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns,
          columnGap: '8px',
          rowGap: '10px',
        }}
      >
        {safeFields.map((field, idx) => {
          if (!field) return null;
          const { name, type, label, className } = field;

          // visibilidad condicional
          if (field.visibleWhen && !field.visibleWhen(safeValues)) return null;

          const column =
            typeof field.gridColumn === 'function'
              ? field.gridColumn(safeValues)
              : field.gridColumn;

          const value = resolveValue(field, safeValues);
          const disabled =
            readOnly || field.disabled || (isFallback && !field.localEditable);

          const shimmerBlock =
            isFallback && !field.localEditable ? (
              <div
                style={{
                  height: type === 'textarea' ? '60px' : '38px',
                  borderRadius: '4px',
                  ...shimmerStyle,
                }}
              />
            ) : null;

          const renderLabel = () =>
            label ? (
              <label
                htmlFor={name}
                className={typeof label === 'object' ? label.className : ''}
              >
                {typeof label === 'object' ? label.name : label}
              </label>
            ) : null;

          switch (type) {
            case 'autocomplete':
              return (
                <AutocompleteField
                  key={name}
                  value={value}
                  onChange={(v) => updateValue(name, v)}
                  {...field.props}
                  gridColumn={column}
                  disabled={disabled}
                />
              );

            case 'telefono':
              return (
                <TelefonoField
                  key={name}
                  value={value}
                  onChange={(v) => updateValue(name, v)}
                  {...field.props}
                  gridColumn={column}
                  disabled={disabled}
                />
              );

            case 'select':
              return (
                <div key={name} style={{ gridColumn: column }}>
                  {renderLabel()}
                  {shimmerBlock ? (
                    shimmerBlock
                  ) : (
                    <SelectField
                      id={name}
                      name={name}
                      label={renderLabel()}
                      value={value}
                      options={field.options}
                      placeholder={field.placeholder}
                      onChange={(val) => updateValue(name, val)}
                      onSelect={(opt) => updateValue(name, opt.value)}
                      gridColumn={column}
                    />
                  )}
                </div>
              );

            case 'textarea':
              return (
                <div key={name} style={{ gridColumn: column }}>
                  {renderLabel()}
                  {shimmerBlock ? (
                    shimmerBlock
                  ) : (
                    <textarea
                      id={name}
                      name={name}
                      value={value}
                      disabled={disabled}
                      placeholder={field.placeholder}
                      onChange={(e) => updateValue(name, e.target.value)}
                      style={{ width: '100%', minHeight: '60px' }}
                    />
                  )}
                </div>
              );

            case 'checkbox':
              return (
                <div
                  key={name}
                  className={className}
                  style={{
                    gridColumn: column || '1 / -1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {isFallback && !field.localEditable ? (
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '3px',
                        ...shimmerStyle,
                      }}
                    />
                  ) : (
                    <input
                      id={name}
                      name={name}
                      type="checkbox"
                      checked={!!value}
                      disabled={disabled}
                      onChange={(e) => updateValue(name, e.target.checked)}
                      ref={attachRef(field, idx)}
                      className="input-field"
                      style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
                    />
                  )}
                  {renderLabel()}
                </div>
              );

            case 'output': {
              // Si estamos en modo shimmer, renderizamos el bloque animado
              if (shimmerBlock) {
                return (
                  <div key={name} style={{ gridColumn: column || '1 / -1' }}>
                    {renderLabel()}
                    {shimmerBlock}
                  </div>
                );
              }

              // Fallback: shimmer genérico si no hay shimmerBlock definido
              if (isFallback) {
                return (
                  <div
                    key={name}
                    className="loading"
                    style={{
                      gridColumn: column || '1 / -1',
                      height: '2.5rem',
                      borderRadius: '4px',
                    }}
                  >
                    {renderLabel()}
                  </div>
                );
              }

              // Render normal del output
              return (
                <div key={name} style={{ gridColumn: column || '1 / -1' }}>
                  {renderLabel()}
                  <output
                    className="input-field"
                    style={{
                      display: 'block',
                      width: '100%',
                      background: '#eee',
                      fontWeight: 'bold',
                    }}
                  >
                    {value}
                  </output>
                </div>
              );
            }

            default:
              return (
                <div key={name} style={{ gridColumn: column }}>
                  {renderLabel()}
                  {shimmerBlock ? (
                    shimmerBlock
                  ) : (
                    <Input
                      id={name}
                      name={name}
                      type={type || 'text'}
                      value={value}
                      disabled={disabled}
                      placeholder={field.placeholder}
                      onChange={(e) => updateValue(name, e.target.value)}
                      ref={attachRef(field, idx)}
                    />
                  )}
                </div>
              );
          }
        })}
      </div>
    </>
  );
});
