import { useCollapsibleGroup } from '@context/form-ingreso/CollapsibleGroupContext';
import { useCollapsible } from '@hooks/form-ingreso/useCollapsible';
import { useSummary } from '@hooks/form-ingreso/useSummary';
import { fieldsetStyle } from '@styles/form-ingreso';
import { useEffect, useLayoutEffect, useRef } from 'react';
import dropdownArrow from '../../assets/form-ingreso/dropdown-arrow.svg';

export default function Collapsible({
  title,
  children,
  main = false,
  initMode = 'auto',
  index = 0,
  visualMode = null,
}) {
  const group = useCollapsibleGroup();
  const isControlledByGroup = main;

  const idRef = useRef(
    () =>
      `${title.replace(/\s+/g, '-').toLowerCase()}-${index}-${Math.random()
        .toString(36)
        .slice(2, 9)}`
  );
  if (typeof idRef.current === 'function') idRef.current = idRef.current();

  // --- LOG INIT ---
  console.groupCollapsed(
    `%c📂 Collapsible MOUNT → "${title}" (#${index})`,
    'background:#444;color:#fff;padding:2px 6px;border-radius:4px'
  );
  console.log('id:', idRef.current);
  console.log('main:', main);
  console.log('initMode:', initMode);
  console.log('visualMode:', visualMode);
  console.groupEnd();

  // --- SHOULD START OPEN ---
  const shouldStartOpen = (() => {
    const val =
      initMode === 'expanded'
        ? true
        : initMode === 'collapsed' || initMode === 'none'
        ? false
        : initMode === 'auto'
        ? main
        : main;

    console.groupCollapsed(
      `%c📌 shouldStartOpen → "${title}"`,
      'color:#0af;font-weight:bold'
    );
    console.log('initMode:', initMode);
    console.log('main:', main);
    console.log('shouldStartOpen:', val);
    console.groupEnd();

    return val;
  })();

  // ⭐⭐ CAMBIO 1: agregar setOpenInstant aquí
  const {
    isOpen,
    toggle,
    contentRef,
    setOpen,
    setOpenInstant, // <-- ADDED
    openedByUser,
    isAnimating,
  } = useCollapsible({
    defaultOpen: shouldStartOpen,
    title,
  });

  // visualMode NO fuerza nada
  const mode =
    visualMode ||
    (() => {
      const t = (title || '').toLowerCase();
      if (t.includes('cliente')) return 'cliente';
      if (t.includes('equipo')) return 'equipo';
      if (t.includes('orden')) return 'orden';
      if (t.includes('líneas') || t.includes('lineas')) return 'lineaServicio';
      return 'auto';
    })();

  console.groupCollapsed(
    `%c🔧 Mode detection for "${title}"`,
    'color:#fa0;font-weight:bold'
  );
  console.log('visualMode:', visualMode);
  console.log('computedMode:', mode);
  console.groupEnd();

  const summary = useSummary({
    containerRef: contentRef,
    mode,
  });

  console.groupCollapsed(
    `%c📝 Summary generated → "${title}"`,
    'color:#6c6;font-weight:bold'
  );
  console.log('summary:', summary);
  console.groupEnd();

  const didMount = useRef(false);

  // ------------------------------------------------------------
  // REGISTER IN GROUP
  // ------------------------------------------------------------
  useLayoutEffect(() => {
    if (!isControlledByGroup) return;

    console.groupCollapsed(
      `%c📚 Group.registerCollapsible → "${title}"`,
      'color:#0af'
    );
    console.log('id:', idRef.current);
    console.log('index:', index);
    console.log('main:', main);
    console.groupEnd();

    group.registerCollapsible(idRef.current, index, {
      setOpen,
      openedByUser,
      main,
      index,
    });
  }, [title, index, main, isControlledByGroup, group, setOpen, openedByUser]);

  // ------------------------------------------------------------
  // INIT MODE ENFORCER  (FIX: evitar animación en init/reset)
  // ------------------------------------------------------------
  useEffect(() => {
    const expected = shouldStartOpen;

    console.groupCollapsed(
      `%c♻ initMode Sync → "${title}"`,
      'color:#9cf;font-weight:bold'
    );
    console.log('initMode:', initMode);
    console.log('shouldStartOpen:', expected);
    console.log('current isOpen:', isOpen);
    console.groupEnd();

    if (expected !== isOpen) {
      console.log(
        `%c➡ setOpenInstant(${expected})`,
        'color:#0f0;font-weight:bold'
      );
      setOpenInstant(expected); // ⭐⭐ CAMBIO 2
    }
  }, [initMode]);

  // ------------------------------------------------------------
  // USER OPEN REGISTER
  // ------------------------------------------------------------
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }

    if (isControlledByGroup && isOpen && openedByUser.current) {
      console.groupCollapsed(
        `%c📖 Group.registerOpen → "${title}"`,
        'color:#0af;font-weight:bold'
      );
      console.log('id:', idRef.current);
      console.log('index:', index);
      console.log('openedByUser:', openedByUser.current);
      console.groupEnd();

      group.registerOpen(idRef.current, index);
    }
  }, [isOpen, isControlledByGroup, group, index]);

  // ------------------------------------------------------------
  // AUTO-OPEN ON FOCUS   (FIX: sin animación)
  // ------------------------------------------------------------
  const handleFocusIn = () => {
    console.groupCollapsed(
      `%c🚨 handleFocusIn → "${title}"`,
      'color:#f80;font-weight:bold'
    );
    console.log('main:', main);
    console.log('isOpen:', isOpen);
    console.groupEnd();

    if (!main) return;

    // ⭐⭐ CAMBIO 3: abrir sin animación
    if (!isOpen) setOpenInstant(true);

    if (isControlledByGroup) group.registerOpen(idRef.current, index);
  };

  // ------------------------------------------------------------
  // CLICK HANDLER (ANTI-SPAM)
  // ------------------------------------------------------------
  let lastToggle = useRef(0);

  const handleClick = () => {
    const now = Date.now();

    console.groupCollapsed(
      `%c🖱 CLICK → "${title}"`,
      'color:#ff0;font-weight:bold'
    );
    console.log('isOpen:', isOpen);
    console.log('isAnimating():', isAnimating());
    console.groupEnd();

    if (now - lastToggle.current < 350) return;
    lastToggle.current = now;

    if (isAnimating()) return;
    toggle();
  };

  const fieldsetClass = [
    fieldsetStyle.collapsible,
    isOpen ? fieldsetStyle.expanded : fieldsetStyle.collapsed,
    isAnimating() ? fieldsetStyle.isAnimating : '',
  ]
    .filter(Boolean)
    .join(' ');

  const arrowClass = [
    fieldsetStyle.arrowIcon,
    isAnimating() ? fieldsetStyle.arrowIconAnimating : '',
  ]
    .filter(Boolean)
    .join(' ');

  // ------------------------------------------------------------
  // LOG CLASES
  // ------------------------------------------------------------
  useEffect(() => {
    console.groupCollapsed(
      `%c🎨 Collapsible Classes → "${title}" (#${index})`,
      'background:#333;color:#7cf;padding:2px 6px;border-radius:4px'
    );

    console.log('isOpen:', isOpen);
    console.log('isAnimating():', isAnimating());
    console.log('main:', main);

    console.log('\n📌 fieldsetClass:', fieldsetClass);

    console.groupCollapsed('%c📘 Explicación de clases', 'color:#0f0');
    fieldsetClass.split(' ').forEach((cl) => {
      if (cl === fieldsetStyle.collapsible) console.log(cl, '→ Base');
      if (cl === fieldsetStyle.expanded) console.log(cl, '→ isOpen === true');
      if (cl === fieldsetStyle.collapsed) console.log(cl, '→ isOpen === false');
      if (cl === fieldsetStyle.isAnimating)
        console.log(cl, '→ Animando transición');
    });
    console.groupEnd();

    console.groupCollapsed('%c🎯 Clases del arrow', 'color:#ff8');
    console.log(arrowClass);
    arrowClass.split(' ').forEach((cl) => {
      if (cl === fieldsetStyle.arrowIcon) console.log(cl, '→ Base flecha');
      if (cl === fieldsetStyle.arrowIconAnimating)
        console.log(cl, '→ Animación flecha');
    });
    console.groupEnd();

    console.groupEnd();
  }, [fieldsetClass, arrowClass, isOpen, isAnimating]);

  return (
    <fieldset
      className={fieldsetClass}
      data-main={main}
      onFocusCapture={handleFocusIn}
      style={{ marginTop: '15px' }}
    >
      <div className={fieldsetStyle.fieldsetHeader} onClick={handleClick}>
        <h2 className={fieldsetStyle.fieldsetHeaderTitle}>{title}</h2>

        <span
          className={fieldsetStyle.legendSummary}
          style={{ opacity: isOpen ? 0 : 1 }}
        >
          {summary}
        </span>

        <img src={dropdownArrow} className={arrowClass} alt="" />
      </div>

      <div className={fieldsetStyle.fieldsetContent} ref={contentRef}>
        {children}
      </div>
    </fieldset>
  );
}
