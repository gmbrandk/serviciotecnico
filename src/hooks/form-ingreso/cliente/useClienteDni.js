import { useIngresoForm } from '@context/form-ingreso/IngresoFormContext';
import { clienteLog } from '@utils/debug/clienteLogger';
import { useEffect, useRef, useState } from 'react';

/*───────────────────────────────────────────────
  Normalización
───────────────────────────────────────────────*/
function buildDraftCliente(dni = '') {
  return {
    _id: null,
    dni,
    nombres: '',
    apellidos: '',
    telefono: '',
    email: '',
    direccion: '',
    calificacion: '',
    isNew: true,
  };
}

/*───────────────────────────────────────────────
  Hook
───────────────────────────────────────────────*/
export function useClienteDni() {
  const { cliente, setCliente } = useIngresoForm();

  const [dni, setDni] = useState(cliente?.dni ?? '');
  const lastActionRef = useRef(null);
  // 'hydrate' | 'invalidate' | 'manual'

  /*───────────────────────────────────────────────
    Hydrate desde contexto (Restore / Autosave)
  ───────────────────────────────────────────────*/
  useEffect(() => {
    const ctxDni = cliente?.dni ?? '';

    if (ctxDni === dni) return;

    clienteLog('HYDRATE', 'CTX→DNI', 'sync-dni', { ctxDni });
    lastActionRef.current = 'hydrate';
    setDni(ctxDni);
  }, [cliente?.dni]);

  /*───────────────────────────────────────────────
    Cambio manual de DNI (usuario)
  ───────────────────────────────────────────────*/
  const onChangeDni = (value) => {
    const normalized = value.trim();

    setDni(value);
    lastActionRef.current = 'manual';

    // ────────────────────────────────────────────
    // Caso 1: había cliente existente → INVALIDAR
    // ────────────────────────────────────────────
    if (cliente?._id && normalized !== cliente.dni) {
      clienteLog('INVALIDATE', 'DNI', 'cliente-existente', {
        prevId: cliente._id,
        newDni: normalized,
      });

      lastActionRef.current = 'invalidate';

      setCliente(buildDraftCliente(normalized));
      return;
    }

    // ────────────────────────────────────────────
    // Caso 2: cliente nuevo o vacío
    // ────────────────────────────────────────────
    setCliente((prev) => ({
      ...(prev ?? buildDraftCliente(normalized)),
      dni: normalized,
      isNew: true,
    }));
  };

  return {
    dni,
    setDni, // útil para selección externa
    onChangeDni,
    lastActionRef,
  };
}
