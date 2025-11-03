// hooks/useTelefonoInput.js
import { useLayoutEffect, useRef, useState } from 'react';
import {
  BANDERA_NEUTRAL,
  buscarPrefijoMasPreciso,
  limpiarNumero,
} from './telefonoUtils';

export function useTelefonoInput({
  paisSeleccionado,
  prefijosTelefonicos,
  handleSelectPais,
  onChange,
}) {
  const [displayValue, setDisplayValue] = useState('+51');
  const [bandera, setBandera] = useState(
    paisSeleccionado?.bandera || BANDERA_NEUTRAL
  );
  const inputRef = useRef(null);
  const pendingCursorRef = useRef(null);

  // 🔹 Control de escritura
  const handleInputChange = (e) => {
    const raw = e.target.value;
    if (!/^[\+\d\s]*$/.test(raw)) return; // Solo +, dígitos y espacios

    pendingCursorRef.current = e.target.selectionStart ?? null;
    setDisplayValue(raw);

    const match = buscarPrefijoMasPreciso(raw, prefijosTelefonicos);
    if (match && match.iso !== paisSeleccionado?.iso) {
      handleSelectPais(match);
      setBandera(match.bandera);
    }
    onChange?.(raw);
  };

  // 🔹 Formatear automáticamente al perder el foco
  const handleBlur = () => {
    const limpio = displayValue.replace(/\s+/g, '');
    const match = buscarPrefijoMasPreciso(limpio, prefijosTelefonicos);
    const codigo = match?.codigo || paisSeleccionado?.codigo || '+';
    const numero = limpiarNumero(limpio, codigo);
    const nuevoDisplay = numero ? `${codigo} ${numero}` : codigo;
    setDisplayValue(nuevoDisplay);
  };

  // 🔹 Restaurar cursor
  useLayoutEffect(() => {
    const pos = pendingCursorRef.current;
    if (pos == null) return;
    const el = inputRef.current;
    if (!el) return;

    try {
      const safePos = Math.max(0, Math.min(pos, el.value.length));
      el.setSelectionRange(safePos, safePos);
    } catch (err) {
      console.warn('⚠️ No se pudo restaurar cursor:', err);
    }
    pendingCursorRef.current = null;
  }, [displayValue]);

  return {
    inputRef,
    bandera,
    setBandera,
    displayValue,
    setDisplayValue,
    handleInputChange,
    handleBlur,
  };
}
