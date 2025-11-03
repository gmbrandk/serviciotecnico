import { useEffect, useRef } from 'react';
import { buscarPrefijoMasPreciso } from './telefonoUtils';

/**
 * Sincroniza el número telefónico con el valor del backend,
 * pero sin sobrescribir los cambios recientes del usuario ni mientras el input esté activo.
 */
export function useTelefonoSync({
  value,
  paisSeleccionado,
  prefijosTelefonicos,
  setDisplayValue,
  setBandera,
  handleSelectPais,
  inputRef, // 👈 asegúrate de pasar esto desde TelefonoField
}) {
  const bloqueadoPorUsuario = useRef(false);
  const valorPrevio = useRef(value);

  // 🛡️ Bloquea sincronización justo después de selección manual del país
  useEffect(() => {
    if (paisSeleccionado?.codigo) {
      bloqueadoPorUsuario.current = true;
      console.log('✋ [Sync] Bloqueo temporal tras selección manual');
      const timer = setTimeout(() => {
        bloqueadoPorUsuario.current = false;
        console.log('✅ [Sync] Bloqueo liberado');
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [paisSeleccionado?.codigo]);

  // 🔄 Sincroniza visualmente cuando cambia el valor del backend
  useEffect(() => {
    if (value === valorPrevio.current) return;
    valorPrevio.current = value;

    if (bloqueadoPorUsuario.current) {
      console.log('✋ [Sync] Ignorado — selección manual reciente');
      return;
    }

    console.groupCollapsed('%c📦 [Sync desde backend]', 'color:#2196f3;');
    console.log('🔸 Valor recibido desde backend:', value);
    console.log(
      '🌍 País actual:',
      paisSeleccionado?.pais,
      paisSeleccionado?.codigo
    );

    // 👇 Verificar si el usuario tiene el input enfocado
    const el = inputRef?.current;
    const isFocused = el && el === document.activeElement;
    if (isFocused) {
      console.log('✋ Usuario escribiendo, no se actualiza visual.');
      console.groupEnd();
      return;
    }

    const detectado = buscarPrefijoMasPreciso(value, prefijosTelefonicos);
    if (!detectado) {
      console.warn('❓ Prefijo no reconocido desde backend');
      console.groupEnd();
      setDisplayValue(value || '');
      return;
    }

    // Si el prefijo del backend es distinto al actual, actualizamos país
    if (detectado.codigo !== paisSeleccionado?.codigo) {
      console.warn(
        `⚠️ Prefijo backend distinto (${detectado.codigo}) → actualizando país.`
      );
      handleSelectPais(detectado);
      setBandera(detectado.bandera);
    }

    // Asegurar formato visual coherente
    const limpio = String(value).replace(/\s+/g, '');
    const numeroLocal = limpio.replace(detectado.codigo, '').replace(/\D/g, '');
    const nuevoDisplay = numeroLocal
      ? `${detectado.codigo} ${numeroLocal}`
      : detectado.codigo;

    console.log('✅ Actualizando displayValue →', nuevoDisplay);
    console.groupEnd();
    setDisplayValue(nuevoDisplay);
  }, [
    value,
    paisSeleccionado,
    prefijosTelefonicos,
    setDisplayValue,
    setBandera,
    handleSelectPais,
    inputRef,
  ]);
}
