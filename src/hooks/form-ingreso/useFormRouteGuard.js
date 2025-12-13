// src/hooks/form-ingreso/useFormRouteGuard.js
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function useFormRouteGuard({
  enabled,
  hasChanges,
  discardAutosave,
  formBasePath,
}) {
  const location = useLocation();
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (!enabled) {
      prevPath.current = location.pathname;
      return;
    }

    const from = prevPath.current;
    const to = location.pathname;

    const leavingForm =
      from.startsWith(formBasePath) && !to.startsWith(formBasePath);

    if (leavingForm) {
      if (!hasChanges) {
        discardAutosave();
      }
      // si hay cambios, lo maneja useConfirmLeave
    }

    prevPath.current = to;
  }, [location.pathname, enabled, hasChanges, discardAutosave, formBasePath]);
}
