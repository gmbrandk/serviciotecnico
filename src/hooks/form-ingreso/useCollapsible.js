// hooks/form-ingreso/useCollapsible.js
import { useCallback, useLayoutEffect, useRef, useState } from 'react';

function lg(group, event, data = {}) {
  console.groupCollapsed(`🔷 [useCollapsible] ${group} → ${event}`);
  if (Object.keys(data).length) console.log('📌 data:', data);
  return () => console.groupEnd();
}

export function useCollapsible({ defaultOpen, title = 'unnamed' } = {}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const contentRef = useRef(null);
  const isAnimating = useRef(false);
  const openedByUser = useRef(false);

  const skipAnimationRef = useRef(false);
  const endListenerRef = useRef(null);

  const didMount = useRef(false);

  /* ======================================================
     🧹 UTIL — limpiar animación SIEMPRE
  ====================================================== */
  const clearAnimation = (el, reason = '') => {
    if (!el) return;
    console.log('🧹 clearAnimation', { title, reason });
    el.style.transition = '';
    el.style.maxHeight = isOpen ? 'none' : '0px';
    el.style.opacity = isOpen ? '1' : '0';
    isAnimating.current = false;
  };

  /* ======================================================
     🔥 EXPAND
  ====================================================== */
  const expand = useCallback(() => {
    const el = contentRef.current;
    const end = lg('expand', 'start', { title });

    if (!el) return end();

    if (skipAnimationRef.current) {
      clearAnimation(el, 'expand-skip');
      return end();
    }

    isAnimating.current = true;

    el.style.maxHeight = '0px';
    el.style.opacity = '0';

    requestAnimationFrame(() => {
      el.style.transition = 'max-height 0.35s ease, opacity 0.35s ease';
      el.style.maxHeight = el.scrollHeight + 'px';
      el.style.opacity = '1';

      const onEnd = () => {
        clearAnimation(el, 'expand-end');
        el.removeEventListener('transitionend', onEnd);
        endListenerRef.current = null;
      };

      endListenerRef.current = onEnd;
      el.addEventListener('transitionend', onEnd);

      // 🔥 FAILSAFE
      setTimeout(() => {
        if (isAnimating.current) {
          console.warn('⚠️ expand timeout → force clear');
          clearAnimation(el, 'expand-timeout');
        }
      }, 400);
    });

    end();
  }, [title, isOpen]);

  /* ======================================================
     🔥 COLLAPSE
  ====================================================== */
  const collapse = useCallback(() => {
    const el = contentRef.current;
    const end = lg('collapse', 'start', { title });

    if (!el) return end();

    if (skipAnimationRef.current) {
      clearAnimation(el, 'collapse-skip');
      return end();
    }

    isAnimating.current = true;

    el.style.maxHeight = el.scrollHeight + 'px';
    el.style.opacity = '1';

    requestAnimationFrame(() => {
      el.style.transition = 'max-height 0.35s ease, opacity 0.35s ease';
      el.style.maxHeight = '0px';
      el.style.opacity = '0';

      const onEnd = () => {
        clearAnimation(el, 'collapse-end');
        el.removeEventListener('transitionend', onEnd);
        endListenerRef.current = null;
      };

      endListenerRef.current = onEnd;
      el.addEventListener('transitionend', onEnd);

      // 🔥 FAILSAFE
      setTimeout(() => {
        if (isAnimating.current) {
          console.warn('⚠️ collapse timeout → force clear');
          clearAnimation(el, 'collapse-timeout');
        }
      }, 400);
    });

    end();
  }, [title, isOpen]);

  /* ======================================================
     🆕 setOpenInstant — SIN animación, pero ESTABLE
  ====================================================== */
  const setOpenInstant = useCallback((next) => {
    const el = contentRef.current;
    skipAnimationRef.current = true;

    setIsOpen(next);

    if (el) {
      el.style.transition = '';
      el.style.maxHeight = next ? 'none' : '0px';
      el.style.opacity = next ? '1' : '0';
    }

    isAnimating.current = false;

    requestAnimationFrame(() => {
      skipAnimationRef.current = false;
    });
  }, []);

  /* ======================================================
     🔄 RESPUESTA A isOpen (SIEMPRE ESTABILIZA)
  ====================================================== */
  useLayoutEffect(() => {
    const el = contentRef.current;

    const end = lg('isOpen effect', 'trigger', {
      title,
      isOpen,
      didMount: didMount.current,
      skipAnimation: skipAnimationRef.current,
      isAnimating: isAnimating.current,
      elementExists: !!el,
    });

    if (!el) return end();

    // 🔒 PRIMER RENDER: aplicar estado SIN animación
    if (!didMount.current) {
      didMount.current = true;

      el.style.transition = '';
      el.style.maxHeight = isOpen ? 'none' : '0px';
      el.style.opacity = isOpen ? '1' : '0';

      isAnimating.current = false;

      console.log('🟢 [useCollapsible] first render → NO animation');
      return end();
    }

    // 🚫 skip explícito
    if (skipAnimationRef.current) {
      console.log('⏭️ [useCollapsible] skipAnimationRef=true');
      return end();
    }

    // 🔥 animaciones SOLO después del mount
    if (isOpen) expand();
    else collapse();

    end();
  }, [isOpen, expand, collapse, title]);

  /* ======================================================
     CLEANUP
  ====================================================== */
  useLayoutEffect(() => {
    return () => {
      const el = contentRef.current;
      if (el && endListenerRef.current) {
        el.removeEventListener('transitionend', endListenerRef.current);
      }
    };
  }, []);

  return {
    isOpen,
    toggle: () => {
      openedByUser.current = true;
      setIsOpen((p) => !p);
    },
    setOpen: setIsOpen,
    setOpenInstant,
    openedByUser,
    contentRef,
    isAnimating: () => isAnimating.current,
  };
}
