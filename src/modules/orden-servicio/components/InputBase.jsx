import { forwardRef } from 'react';

export const Input = forwardRef(
  (
    {
      id,
      name,
      type = 'text',
      label,
      placeholder,
      value,
      disabled = false,
      readOnly = false,
      description,
      onChange,
      onKeyDown,
      onFocus,
      onBlur,
      onPointerDown,
      onClick,
      onInput,
      style,
      classes = {},
      maxLength,
      inputMode,
      autoComplete = 'off',
    },
    ref
  ) => {
    const {
      root = '',
      label: labelCls = '',
      input = '',
      description: descCls = '',
    } = classes;

    const inputId = id || name;

    return (
      <div className={`input-wrapper ${root}`} style={style}>
        {/* Label accesible */}
        {label && (
          <label
            htmlFor={inputId}
            className={`sr-only input-label ${labelCls}`}
          >
            {typeof label === 'string' ? label : label?.name}
          </label>
        )}

        {/* Campo de entrada */}
        <input
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value ?? ''}
          disabled={disabled}
          readOnly={readOnly}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          onPointerDown={onPointerDown}
          onClick={onClick}
          onInput={onInput}
          maxLength={maxLength}
          inputMode={inputMode}
          autoComplete={autoComplete}
          aria-describedby={description ? `${inputId}-desc` : undefined}
          className={`input-field ${input}`}
          ref={ref}
        />

        {/* Descripción accesible */}
        {description && (
          <small
            id={`${inputId}-desc`}
            className={`input-description ${descCls}`}
          >
            {description}
          </small>
        )}
      </div>
    );
  }
);
