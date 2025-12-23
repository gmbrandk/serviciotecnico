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
  mode: explicitMode = null,
}) {
  const group = useCollapsibleGroup();
  const isControlledByGroup = main;

  const idRef = useRef(`${title.replace(/\s+/g, '-').toLowerCase()}-${index}`);

  const shouldStartOpen =
    initMode === 'expanded'
      ? true
      : initMode === 'collapsed' || initMode === 'none'
      ? false
      : main;

  const {
    isOpen,
    toggle,
    contentRef,
    setOpen,
    setOpenInstant,
    openedByUser,
    isAnimating,
  } = useCollapsible({
    defaultOpen: shouldStartOpen,
    title,
  });

  /** -----------------------------------------------------------
   *  SYNC INIT MODE (reacciona a cambios reales, sin pisar al usuario)
   * ------------------------------------------------------------ */
  useEffect(() => {
    // Si el usuario ya interactuó, no forzamos nada
    if (openedByUser.current) return;

    if (shouldStartOpen !== isOpen) {
      console.log('🧭 [Collapsible] sync initMode → setOpenInstant', {
        title,
        shouldStartOpen,
        isOpen,
      });

      setOpenInstant(shouldStartOpen);
    }
  }, [shouldStartOpen, isOpen, setOpenInstant, openedByUser, title]);

  /* ======================================================
     REGISTER IN GROUP
  ====================================================== */
  useLayoutEffect(() => {
    if (!isControlledByGroup) return;

    group.registerCollapsible(idRef.current, index, {
      setOpen,
      openedByUser,
      main,
      index,
    });
  }, [group, index, main, isControlledByGroup, setOpen, openedByUser]);

  /* ======================================================
     REGISTER OPEN EVENTS
  ====================================================== */
  const didMount = useRef(false);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }

    if (isControlledByGroup && isOpen && openedByUser.current === true) {
      console.log('📤 [Collapsible] apertura manual', title);
      group.registerOpen(idRef.current, index);
    }
  }, [isOpen, isControlledByGroup, group, index, title]);

  /* ======================================================
     AUTO-OPEN ON FOCUS
  ====================================================== */
  const handleFocusIn = () => {
    if (!main) return;
    if (!isOpen) setOpenInstant(true);
    if (isControlledByGroup) group.registerOpen(idRef.current, index);
  };

  /* ======================================================
     CLICK HANDLER — SIN BLOQUEO JS
  ====================================================== */
  const handleClick = () => {
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

  const mode =
    explicitMode ||
    visualMode ||
    (() => {
      const t = (title || '').toLowerCase();
      if (t.includes('cliente')) return 'cliente';
      if (t.includes('equipo')) return 'equipo';
      if (t.includes('orden')) return 'orden';
      if (t.includes('líneas') || t.includes('lineas')) return 'lineaServicio';
      return 'auto';
    })();

  const summary = useSummary({
    containerRef: contentRef,
    mode,
  });

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
