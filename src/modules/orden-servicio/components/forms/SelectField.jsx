import { useEffect, useRef, useState } from 'react';
import '../../styles/MultiStepForm.css';
import './SelectField.css';

export function SelectField({
  id,
  name,
  label,
  value,
  options = [],
  placeholder = 'Selecciona...',
  disabled = false,
  gridColumn = '1 / 4',
  onChange, // recibe el value
  onSelect, // recibe la opción completa
}) {
  const [open, setOpen] = useState(false);
  const [focusInside, setFocusInside] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const wrapperRef = useRef(null);
  const listRef = useRef(null);
  const buttonRef = useRef(null);

  const selectedOption = options.find((o) => o.value === value);

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleDocClick(e) {
      if (!wrapperRef.current?.contains(e.target)) {
        setOpen(false);
        setFocusInside(false);
      }
    }
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, []);

  // Scroll automático al item activo
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const item =
      listRef.current?.querySelectorAll('[role="option"]')[activeIndex];
    if (item) item.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  const handleSelect = (opt) => {
    onChange?.(opt.value);
    onSelect?.(opt);
    setOpen(false);
    setFocusInside(false);
  };

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setOpen(true);
        setActiveIndex(0);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const opt = options[activeIndex] ?? options[0];
      if (opt) handleSelect(opt);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      setFocusInside(false);
    }
  };

  return (
    <div className="select-wrapper" style={{ gridColumn }} ref={wrapperRef}>
      {label && (
        <label htmlFor={id} className={label?.className}>
          {label?.name || label}
        </label>
      )}

      {/* Input hidden para formularios HTML nativos */}
      <input type="hidden" name={name} value={value} />

      <button
        id={id}
        type="button"
        ref={buttonRef}
        className="select-button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          setOpen((o) => !o);
          setFocusInside(true);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocusInside(true)}
        onBlur={() => {
          setTimeout(() => {
            if (!wrapperRef.current.contains(document.activeElement)) {
              setOpen(false);
              setFocusInside(false);
            }
          }, 100);
        }}
        title={selectedOption ? selectedOption.label : placeholder}
      >
        <span className="select-label">
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <span className="select-caret">
          <img src="/dropdown-arrow.svg" alt="abrir opciones" />
        </span>
      </button>

      {open && focusInside && (
        <ul role="listbox" className="select-list" ref={listRef}>
          {options.map((opt, index) => {
            const active = index === activeIndex;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={active}
                className={`select-item ${active ? 'active' : ''}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(opt);
                }}
                onMouseEnter={() => setActiveIndex(index)}
                title={opt.label}
              >
                {opt.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
