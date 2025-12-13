// src/hooks/useConfirmLeave.js
import { useNavigate } from 'react-router-dom';

export function useConfirmLeave({ hasChanges, discardAutosave }) {
  const navigate = useNavigate();

  return (to) => {
    if (!hasChanges) {
      discardAutosave();
      navigate(to);
      return;
    }

    const ok = window.confirm(
      'Tienes cambios sin guardar. ¿Seguro que deseas salir?'
    );

    if (ok) {
      discardAutosave();
      navigate(to);
    }
  };
}
