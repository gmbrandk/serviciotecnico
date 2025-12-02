import { useCollapsibleGroup } from '@context/form-ingreso/CollapsibleGroupContext';
import { useCollapsible } from '@hooks/form-ingreso/useCollapsible';
import { useSummary } from '@hooks/form-ingreso/useSummary';
import { useEffect, useLayoutEffect, useRef } from 'react';
import dropdownArrow from '../../assets/form-ingreso/dropdown-arrow.svg';

// ⬅️ IMPORTAR CSS MODULE
import { fieldsetStyle } from '@styles/form-ingreso';

export default function Collapsible({
  title,
  children,
  main = false,
  initMode = 'auto',
  index = 0,
  mode: forcedMode = null,
}) {
  const group = useCollapsibleGroup();
  const isControlledByGroup = main;

  const shouldStartOpen = (() => {
    switch (initMode) {
      case 'expanded':
        return true;
      case 'collapsed':
      case 'none':
        return false;
      case 'auto':
      default:
        return main;
    }
  })();

  const { isOpen, toggle, contentRef, setOpen, openedByUser, isAnimating } =
    useCollapsible({
      defaultOpen: shouldStartOpen,
      title,
    });

  const idRef = useRef(
    () =>
      `${title.replace(/\s+/g, '-').toLowerCase()}-${index}-${Math.random()
        .toString(36)
        .slice(2, 9)}`
  );
  if (typeof idRef.current === 'function') idRef.current = idRef.current();

  const mode =
    forcedMode ||
    (() => {
      const t = (title || '').toLowerCase();
      if (t.includes('cliente')) return 'cliente';
      if (t.includes('equipo')) return 'equipo';
      if (t.includes('orden')) return 'orden';
      if (t.includes('ficha')) return 'ficha';
      return 'auto';
    })();

  const summary = useSummary({
    containerRef: contentRef,
    mode,
  });

  const didMount = useRef(false);

  useLayoutEffect(() => {
    if (!isControlledByGroup) return;

    group.registerCollapsible(idRef.current, index, {
      setOpen,
      openedByUser,
      main,
      index,
    });
  }, [title, index, main, isControlledByGroup, group, setOpen, openedByUser]);

  useEffect(() => {
    const shouldBeOpen = shouldStartOpen;
    if (shouldBeOpen !== isOpen) setOpen(shouldBeOpen);
  }, [initMode]);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }

    if (isControlledByGroup && isOpen && openedByUser.current) {
      group.registerOpen(idRef.current, index);
    }
  }, [isOpen, isControlledByGroup, group, index]);

  const handleFocusIn = () => {
    if (!main) return;
    if (!isOpen) setOpen(true);
    if (isControlledByGroup) group.registerOpen(idRef.current, index);
  };

  let lastToggle = useRef(0);

  const handleClick = () => {
    const now = Date.now();
    if (now - lastToggle.current < 350) return;
    lastToggle.current = now;

    if (isAnimating()) return;
    toggle();
  };

  // ⬅️ ARMAR CLASES DEL FIELDSET CON MODULES
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
