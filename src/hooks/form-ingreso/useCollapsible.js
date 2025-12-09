// hooks/form-ingreso/useCollapsible.js
import { useCallback, useLayoutEffect, useRef, useState } from 'react';

function lg(group, event, data = {}) {
  console.groupCollapsed(`🔷 [useCollapsible] ${group} → ${event}`);
  if (Object.keys(data).length) console.log('📌 data:', data);
  return () => console.groupEnd();
}

/* ===================================================================
   🎯 useCollapsible — versión REFACTORIZADA 2025
   - setOpenInstant 100% sin animación
   - skipAnimationRef (antes shouldAnimateRef)
   - ninguna animación indeseada al montar o sincronizar estado
=================================================================== */
export function useCollapsible({ defaultOpen, title = 'unnamed' } = {}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const contentRef = useRef(null);
  const isAnimating = useRef(false);
  const openedByUser = useRef(false);

  // 🔥 Flag Maestro: controla si se debe animar o no
  const skipAnimationRef = useRef(false);

  const endListenerRef = useRef(null);

  /* ================================================================
     🔥 expand
  ================================================================ */
  const expand = useCallback(() => {
    const el = contentRef.current;
    const end = lg('expand', 'start', {
      title,
      isAnimating: isAnimating.current,
      skipAnimation: skipAnimationRef.current,
      scrollHeight: el?.scrollHeight,
      timestamp: new Date().toISOString(),
    });

    if (!el) {
      console.warn('expand → NO ELEMENT, abort');
      return end();
    }

    // Si skipAnimationRef === true → NO ANIMAR
    if (skipAnimationRef.current) {
      console.log('expand → SKIPPED animation (skipAnimationRef=true)');
      el.style.transition = '';
      el.style.maxHeight = 'none';
      el.style.opacity = '1';
      isAnimating.current = false;
      return end();
    }

    isAnimating.current = true;

    // PREP
    el.style.maxHeight = 'none';
    const forced1 = el.offsetHeight; // reflow
    const fullHeight = el.scrollHeight + 'px';

    console.log('expand → reflow1:', forced1, 'fullHeight:', fullHeight);

    el.style.maxHeight = '0px';
    el.style.opacity = '0';

    // limpiar listeners previos
    if (endListenerRef.current) {
      console.log('expand → removing previous transitionend listener');
      el.removeEventListener('transitionend', endListenerRef.current);
      endListenerRef.current = null;
    }

    requestAnimationFrame(() => {
      console.log('expand → animating to fullHeight:', fullHeight);

      el.style.transition = 'max-height 0.35s ease, opacity 0.35s ease';
      el.style.maxHeight = fullHeight;
      el.style.opacity = '1';

      const onEnd = () => {
        console.log('expand → transitionend fired: animation complete');
        el.style.transition = '';
        el.style.maxHeight = 'none';
        el.removeEventListener('transitionend', onEnd);
        endListenerRef.current = null;
        isAnimating.current = false;
      };

      endListenerRef.current = onEnd;
      el.addEventListener('transitionend', onEnd);

      end();
    });
  }, [title]);

  /* ================================================================
     🔥 collapse
  ================================================================ */
  const collapse = useCallback(() => {
    const el = contentRef.current;
    const end = lg('collapse', 'start', {
      title,
      isAnimating: isAnimating.current,
      skipAnimation: skipAnimationRef.current,
      scrollHeight: el?.scrollHeight,
      timestamp: new Date().toISOString(),
    });

    if (!el) {
      console.warn('collapse → NO ELEMENT, abort');
      return end();
    }

    // Si skipAnimationRef === true → NO ANIMAR
    if (skipAnimationRef.current) {
      console.log('collapse → SKIPPED animation (skipAnimationRef=true)');
      el.style.transition = '';
      el.style.maxHeight = '0px';
      el.style.opacity = '0';
      isAnimating.current = false;
      return end();
    }

    isAnimating.current = true;

    // asegurar maxHeight correcto
    if (!el.style.maxHeight || el.style.maxHeight === 'none') {
      el.style.maxHeight = el.scrollHeight + 'px';
      console.log('collapse → fixing maxHeight to scrollHeight');
    }

    const forced1 = el.offsetHeight;
    console.log('collapse → forced reflow1:', forced1);

    // limpiar listener previo
    if (endListenerRef.current) {
      console.log('collapse → removing previous transitionend listener');
      el.removeEventListener('transitionend', endListenerRef.current);
      endListenerRef.current = null;
    }

    requestAnimationFrame(() => {
      console.log('collapse → animating to 0px');

      el.style.transition = 'max-height 0.35s ease, opacity 0.35s ease';
      el.style.maxHeight = '0px';
      el.style.opacity = '0';

      const onEnd = () => {
        console.log('collapse → transitionend fired: animation complete');
        el.style.transition = '';
        el.removeEventListener('transitionend', onEnd);
        endListenerRef.current = null;
        isAnimating.current = false;
      };

      endListenerRef.current = onEnd;
      el.addEventListener('transitionend', onEnd);

      end();
    });
  }, [title]);

  /* ================================================================
     🆕 setOpenInstant — CAMBIO SIN ANIMAR (100% instantáneo)
  ================================================================ */
  const setOpenInstant = useCallback(
    (next) => {
      const el = contentRef.current;
      const end = lg('setOpenInstant', 'instant-set', {
        title,
        next,
        skipAnimation: true,
        timestamp: new Date().toISOString(),
      });

      // 🔥 Desactivar animación SOLO para esta acción
      skipAnimationRef.current = true;

      setIsOpen(next);

      if (el) {
        console.log('setOpenInstant → applying final style instantly');
        el.style.transition = '';
        el.style.maxHeight = next ? 'none' : '0px';
        el.style.opacity = next ? '1' : '0';
      }

      isAnimating.current = false;

      // 🔥 restaurar animaciones para cambios futuros
      requestAnimationFrame(() => {
        skipAnimationRef.current = false;
        console.log('setOpenInstant → animations restored');
      });

      end();
    },
    [title]
  );

  /* ================================================================
     🔄 Efecto que responde a isOpen
  ================================================================ */
  useLayoutEffect(() => {
    const el = contentRef.current;

    const end = lg('isOpen effect', 'trigger', {
      title,
      isOpen,
      skipAnimation: skipAnimationRef.current,
      isAnimating: isAnimating.current,
      elementExists: !!el,
      timestamp: new Date().toISOString(),
    });

    if (!el) return end();

    // 🚫 Si skipAnimationRef == true, no animar NADA
    if (skipAnimationRef.current) {
      console.log('isOpen effect → skipping because skipAnimationRef=true');
      return end();
    }

    // ahora sí animar
    if (isOpen) expand();
    else collapse();

    end();
  }, [isOpen, expand, collapse, title]);

  /* ================================================================
     toggle (siempre ANIMA, acción del usuario)
  ================================================================ */
  const toggle = () => {
    const end = lg('toggle', 'user-click', {
      title,
      prev: isOpen,
      timestamp: new Date().toISOString(),
    });

    openedByUser.current = true;

    // 🔥 Asegurar que el toggle SIEMPRE anime:
    skipAnimationRef.current = false;

    setIsOpen((p) => {
      const next = !p;
      console.log('toggle → setIsOpen', { prev: p, next });
      return next;
    });

    end();
  };

  /* ================================================================
     Cleanup
  ================================================================ */
  useLayoutEffect(() => {
    return () => {
      const el = contentRef.current;
      const end = lg('UNMOUNT', 'cleanup', { title });

      if (el && endListenerRef.current) {
        console.log('UNMOUNT → removing transitionend listener');
        el.removeEventListener('transitionend', endListenerRef.current);
      }

      endListenerRef.current = null;
      end();
    };
  }, [title]);

  return {
    isOpen,
    toggle,
    setOpen: setIsOpen,
    setOpenInstant,
    openedByUser,
    contentRef,
    isAnimating: () => isAnimating.current,
  };
}
