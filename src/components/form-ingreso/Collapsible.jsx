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
  mode: explicitMode = null, //  ✔ MODO EXPLÍCITO
}) {
  const group = useCollapsibleGroup();
  const isControlledByGroup = main;

  /** -----------------------------------------------------------
   *  UNIQUE ID
   ------------------------------------------------------------ */
  const idRef = useRef(
    () =>
      `${title.replace(/\s+/g, '-').toLowerCase()}-${index}-${Math.random()
        .toString(36)
        .slice(2, 9)}`
  );
  if (typeof idRef.current === 'function') idRef.current = idRef.current();

  /** -----------------------------------------------------------
   *  SHOULD START OPEN
   ------------------------------------------------------------ */
  const shouldStartOpen = (() => {
    return initMode === 'expanded'
      ? true
      : initMode === 'collapsed' || initMode === 'none'
      ? false
      : initMode === 'auto'
      ? main
      : main;
  })();

  /** -----------------------------------------------------------
   *  useCollapsible
   ------------------------------------------------------------ */
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
   *  MODE RESOLUTION (la prioridad correcta)
   ------------------------------------------------------------ */
  const mode =
    explicitMode || // 1️⃣ si viene desde props → PRIORIDAD MÁXIMA
    visualMode || // 2️⃣ modo visual opcional
    (() => {
      // 3️⃣ inferencia automática según título
      const t = (title || '').toLowerCase();
      if (t.includes('cliente')) return 'cliente';
      if (t.includes('equipo')) return 'equipo';
      if (t.includes('orden')) return 'orden';
      if (t.includes('líneas') || t.includes('lineas')) return 'lineaServicio';
      return 'auto';
    })();

  /** -----------------------------------------------------------
   *  SUMMARY
   ------------------------------------------------------------ */
  const summary = useSummary({
    containerRef: contentRef,
    mode,
  });

  /** -----------------------------------------------------------
   *  REGISTER IN GROUP
   ------------------------------------------------------------ */
  useLayoutEffect(() => {
    if (!isControlledByGroup) return;

    group.registerCollapsible(idRef.current, index, {
      setOpen,
      openedByUser,
      main,
      index,
    });
  }, [title, index, main, isControlledByGroup, group, setOpen, openedByUser]);

  /** -----------------------------------------------------------
   *  SYNC INIT MODE (NO animación)
   ------------------------------------------------------------ */
  useEffect(() => {
    if (shouldStartOpen !== isOpen) {
      setOpenInstant(shouldStartOpen);
    }
  }, [initMode]);

  /** -----------------------------------------------------------
   *  REGISTER OPEN EVENTS
   ------------------------------------------------------------ */
  const didMount = useRef(false);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }

    if (isControlledByGroup && isOpen && openedByUser.current) {
      group.registerOpen(idRef.current, index);
    }
  }, [isOpen, isControlledByGroup, group, index]);

  /** -----------------------------------------------------------
   *  AUTO-OPEN ON FOCUS (sin animación)
   ------------------------------------------------------------ */
  const handleFocusIn = () => {
    if (!main) return;

    if (!isOpen) setOpenInstant(true);
    if (isControlledByGroup) group.registerOpen(idRef.current, index);
  };

  /** -----------------------------------------------------------
   *  CLICK HANDLER ANTI-SPAM
   ------------------------------------------------------------ */
  let lastToggle = useRef(0);

  const handleClick = () => {
    const now = Date.now();
    if (now - lastToggle.current < 350) return;
    lastToggle.current = now;

    if (!isAnimating()) toggle();
  };

  /** -----------------------------------------------------------
   *  CLASSES
   ------------------------------------------------------------ */
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

  /** -----------------------------------------------------------
   *  RENDER
   ------------------------------------------------------------ */
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
