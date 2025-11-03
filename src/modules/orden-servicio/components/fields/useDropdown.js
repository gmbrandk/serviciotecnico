// hooks/useDropdown.js
import { useCallback, useEffect, useRef, useState } from 'react';

export function useDropdown({ onSelect, closeOnSelect = true } = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef(null);

  // 🔹 Alternar apertura
  const toggle = useCallback(() => {
    console.groupCollapsed('%c📂 [Dropdown.toggle]', 'color:#00bcd4;');
    console.log('Estado actual:', !isOpen ? '🟢 Abierto' : '🔴 Cerrado');
    console.groupEnd();
    setIsOpen((v) => !v);
  }, [isOpen]);

  // 🔹 Cerrar dropdown
  const close = useCallback(() => {
    console.log('%c🚪 [Dropdown.close] Cerrando dropdown', 'color:#f44336;');
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

  // 🔹 Seleccionar un item
  const handleSelect = useCallback(
    (item, event) => {
      console.groupCollapsed('%c🎯 [Dropdown.handleSelect]', 'color:#ff9800;');
      console.log('Item recibido:', item);
      console.log('Evento:', event?.type);
      console.log('closeOnSelect:', closeOnSelect);
      console.groupEnd();

      try {
        onSelect?.(item, event);
        console.log('%c✅ onSelect ejecutado correctamente', 'color:#4caf50;');
      } catch (err) {
        console.error('❌ Error al ejecutar onSelect:', err);
      }

      if (closeOnSelect) close();
    },
    [onSelect, closeOnSelect, close]
  );

  // 🔹 Cerrar al hacer click fuera
  // hooks/useDropdown.js
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        console.log(
          '%c🖱️ [ClickOutside] Clic fuera del dropdown → se cierra',
          'color:#9e9e9e;'
        );
        close();
      }
    };

    if (isOpen) {
      // ✅ Escuchamos 'click' en lugar de 'mousedown'
      document.addEventListener('click', handleClickOutside);
    }

    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen, close]);

  // 🔹 Navegación con teclado
  const handleKeyDown = useCallback(
    (e, items = []) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % items.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        handleSelect(items[activeIndex], e);
      } else if (e.key === 'Escape') {
        close();
      }
    },
    [isOpen, activeIndex, handleSelect, close]
  );

  return {
    isOpen,
    toggle,
    open: () => setIsOpen(true),
    close,
    handleSelect,
    handleKeyDown,
    activeIndex,
    setActiveIndex,
    dropdownRef,
  };
}
