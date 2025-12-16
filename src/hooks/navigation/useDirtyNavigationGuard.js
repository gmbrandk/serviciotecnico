import { useCallback, useEffect, useState } from 'react';
import { useBlocker } from 'react-router-dom';

export default function useDirtyNavigationGuard({
  isDirty,
  onDiscard,
  enabled = true,
}) {
  const [showExitDialog, setShowExitDialog] = useState(false);

  /*───────────────────────────────────────────────
    🚨 Navegación interna (BACK / mouse back / Link)
    React Router 6.30+
  ───────────────────────────────────────────────*/
  const blocker = useBlocker(enabled && isDirty);

  // Cuando el router bloquea, abrimos el modal
  useEffect(() => {
    if (blocker.state === 'blocked') {
      setShowExitDialog(true);
    }
  }, [blocker.state]);

  /*───────────────────────────────────────────────
    🚨 Navegación del navegador (refresh / cerrar)
    → última barrera
  ───────────────────────────────────────────────*/
  useEffect(() => {
    const handler = (e) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  /*───────────────────────────────────────────────
    🧠 Acciones del modal
  ───────────────────────────────────────────────*/

  // ❎ Seguir editando
  const stay = useCallback(() => {
    setShowExitDialog(false);
    blocker.reset(); // cancela navegación
  }, [blocker]);

  // 💾 Salir y conservar borrador
  const leaveKeepDraft = useCallback(() => {
    setShowExitDialog(false);
    blocker.proceed(); // continúa navegación
  }, [blocker]);

  // 🗑️ Salir y descartar
  const leaveDiscard = useCallback(() => {
    onDiscard?.();
    setShowExitDialog(false);
    blocker.proceed(); // continúa navegación
  }, [blocker, onDiscard]);

  return {
    showExitDialog,
    stay,
    leaveKeepDraft,
    leaveDiscard,
  };
}
