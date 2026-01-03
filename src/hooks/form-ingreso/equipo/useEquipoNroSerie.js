import { useIngresoForm } from '@context/form-ingreso/IngresoFormContext';
import { useEffect, useRef, useState } from 'react';

/*───────────────────────────────────────────────
  Normalización dominio
───────────────────────────────────────────────*/
function buildDraftEquipo(nroSerie = '') {
  return {
    _id: null,
    nroSerie,
    tipo: '',
    marca: '',
    modelo: '',
    sku: '',
    macAddress: '',
    imei: '',
    procesador: '',
    ram: '',
    almacenamiento: '',
    gpu: '',
    isNew: true,
  };
}

/*───────────────────────────────────────────────
  Hook de dominio
───────────────────────────────────────────────*/
export function useEquipoNroSerie() {
  const { equipo, setEquipo } = useIngresoForm();

  const [nroSerie, setNroSerie] = useState(equipo?.nroSerie ?? '');
  const lastActionRef = useRef(null);
  // 'hydrate' | 'invalidate' | 'manual'

  /*───────────────────────────────────────────────
    Hydrate desde contexto
  ───────────────────────────────────────────────*/
  useEffect(() => {
    const ctxSerie = equipo?.nroSerie ?? '';

    if (ctxSerie === nroSerie) return;

    lastActionRef.current = 'hydrate';
    setNroSerie(ctxSerie);
  }, [equipo?.nroSerie]);

  /*───────────────────────────────────────────────
    Cambio manual (usuario)
  ───────────────────────────────────────────────*/
  const onChangeNroSerie = (value) => {
    const normalized = value.trim();

    setNroSerie(value);
    lastActionRef.current = 'manual';

    // ────────────────────────────────────────────
    // Caso 1: había equipo existente → INVALIDAR
    // ────────────────────────────────────────────
    if (equipo?._id && normalized !== equipo.nroSerie) {
      lastActionRef.current = 'invalidate';

      setEquipo(buildDraftEquipo(normalized));
      return;
    }

    // ────────────────────────────────────────────
    // Caso 2: equipo nuevo o vacío
    // ────────────────────────────────────────────
    setEquipo((prev) => ({
      ...(prev ?? buildDraftEquipo(normalized)),
      nroSerie: normalized,
      isNew: true,
    }));
  };

  return {
    nroSerie,
    setNroSerie, // usado por autocomplete
    onChangeNroSerie,
    lastActionRef,
  };
}
