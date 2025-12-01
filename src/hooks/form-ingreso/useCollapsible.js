// hooks/form-ingreso/useCollapsible.js
import { useCallback, useLayoutEffect, useRef, useState } from 'react';

export function useCollapsible({ defaultOpen }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef(null);
  const isAnimating = useRef(false);
  const openedByUser = useRef(false);

  /* =====================================================
     🔥 Motor de animación EXACTO al original
  ===================================================== */

  const expand = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;

    isAnimating.current = true;

    el.style.maxHeight = 'none';
    el.offsetHeight;
    const fullHeight = el.scrollHeight + 'px';

    el.style.maxHeight = '0px';
    el.style.opacity = '0';

    requestAnimationFrame(() => {
      el.style.transition = 'max-height 0.35s ease, opacity 0.35s ease';
      el.style.maxHeight = fullHeight;
      el.style.opacity = '1';

      const onEnd = () => {
        el.style.transition = '';
        el.style.maxHeight = 'none';
        el.removeEventListener('transitionend', onEnd);
        isAnimating.current = false;
      };
      el.addEventListener('transitionend', onEnd);
    });
  }, []);

  const collapse = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;

    isAnimating.current = true;

    if (!el.style.maxHeight || el.style.maxHeight === 'none') {
      el.style.maxHeight = el.scrollHeight + 'px';
    }

    el.offsetHeight;

    requestAnimationFrame(() => {
      el.style.transition = 'max-height 0.35s ease, opacity 0.35s ease';
      el.style.maxHeight = '0px';
      el.style.opacity = '0';

      const onEnd = () => {
        el.style.transition = '';
        el.removeEventListener('transitionend', onEnd);
        isAnimating.current = false;
      };
      el.addEventListener('transitionend', onEnd);
    });
  }, []);

  /* =====================================================
     🔄 Reaccionar cuando isOpen cambia
  ===================================================== */
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    if (isOpen) {
      expand();
    } else {
      collapse();
    }
  }, [isOpen, expand, collapse]);

  const toggle = () => {
    openedByUser.current = true;
    setIsOpen((prev) => !prev);
  };

  return {
    isOpen,
    toggle,
    setOpen: setIsOpen,
    openedByUser,
    contentRef,
    isAnimating: () => isAnimating.current,
  };
}
