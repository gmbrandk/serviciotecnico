// hooks/form-ingreso/useSummary.js
import { useCallback, useEffect, useState } from 'react';
import { useIngresoForm } from '@context/form-ingreso/IngresoFormContext';

/**
 * useSummary({ containerRef, mode })
 * mode = cliente | equipo | orden | lineaServicio | ficha | auto
 */
export function useSummary({ containerRef = null, mode = 'auto' } = {}) {
  let formCtx = null;
  try {
    formCtx = useIngresoForm();
  } catch {
    formCtx = null;
  }

  const truncate = (str, max = 40) =>
    str.length > max ? str.slice(0, max).trim() + '…' : str;

  const summaryFromState = useCallback(() => {
    if (!formCtx) return '';

    const { cliente, equipo, orden } = formCtx;

    // ------------------------
    // CLIENTE
    // ------------------------
    if (
      (mode === 'cliente' || mode === 'auto') &&
      cliente &&
      (cliente.nombres || cliente.apellidos || cliente.dni)
    ) {
      const n = (cliente.nombres || '').trim();
      const a = (cliente.apellidos || '').trim();
      const d = (cliente.dni || '').trim();
      return `${n} ${a}`.trim() + (d ? ` — DNI ${d}` : '');
    }

    // ------------------------
    // EQUIPO
    // ------------------------
    if (
      (mode === 'equipo' || mode === 'auto') &&
      equipo &&
      (equipo.marca || equipo.modelo || equipo.nroSerie)
    ) {
      const marca = (equipo.marca || '').trim();
      const modelo = (equipo.modelo || '').trim();
      const nro = (equipo.nroSerie || equipo._id || '').trim();
      return `${marca} ${modelo}`.trim() + (nro ? ` — ${nro}` : '');
    }

    // ------------------------
    // ORDEN (usa truncate)
    // ------------------------
    if (
      (mode === 'orden' || mode === 'auto') &&
      orden &&
      Array.isArray(orden.lineasServicio) &&
      orden.lineasServicio.length > 0
    ) {
      const descs = orden.lineasServicio
        .map((l) => (l.descripcion || l.tipoTrabajo?.nombre || '').trim())
        .filter(Boolean)
        .slice(0, 3)
        .join(', ');

      return descs ? truncate(descs) : 'Sin líneas';
    }

    // ------------------------
    // LÍNEA DE SERVICIO (usa truncate)
    // ------------------------
    if (
      (mode === 'lineaServicio' || mode === 'auto') &&
      orden &&
      Array.isArray(orden.lineasServicio) &&
      orden.lineasServicio.length > 0
    ) {
      const descs = orden.lineasServicio
        .map((l) => (l.descripcion || l.tipoTrabajo?.nombre || '').trim())
        .filter(Boolean)
        .slice(0, 3)
        .join(', ');

      return descs ? truncate(descs) : 'Sin líneas';
    }

    // ------------------------
    // FICHA TÉCNICA (corregido)
    // ------------------------
    if (mode === 'ficha') {
      const fs = containerRef?.current;
      const q = (s) => (fs?.querySelector(s)?.value || '').trim();

      const cpu =
        q('[name="procesador"]') || q('[name="fichaTecnicaManual[cpu]"]');
      const ram = q('[name="ram"]') || q('[name="fichaTecnicaManual[ram]"]');

      if (cpu || ram) {
        return `${cpu || 'CPU?'}${ram ? ' | ' + ram : ''}`;
      }
    }

    return '';
  }, [formCtx, mode, containerRef]);

  // ============================
  // FALLBACK DOM
  // ============================
  const computeFromDOM = useCallback(() => {
    const fs = containerRef?.current;
    if (!fs) return '';

    const q = (s) => (fs.querySelector(s)?.value || '').trim();

    // cliente
    if (mode === 'cliente') {
      const n = q('[name="nombres"]');
      const a = q('[name="apellidos"]');
      const d = q('[name="dni"]');
      if (n || a || d) return `${n} ${a}`.trim() + (d ? ` — DNI ${d}` : '');
    }

    // equipo
    if (mode === 'equipo') {
      const marca = q('[name="marca"]');
      const modelo = q('[name="modelo"]');
      const nro = q('[name="nroSerie"]');
      if (marca || modelo || nro)
        return `${marca} ${modelo}`.trim() + (nro ? ` — ${nro}` : '');
    }

    // orden (DOM, con truncate)
    if (mode === 'orden') {
      const descs = [...fs.querySelectorAll('[data-descripcion]')]
        .map((i) => i.value.trim())
        .filter(Boolean)
        .join(', ');
      return descs ? truncate(descs) : '';
    }

    // ficha técnica (DOM)
    if (mode === 'ficha') {
      const cpu = q('[name="fichaTecnicaManual[cpu]"]');
      const ram = q('[name="fichaTecnicaManual[ram]"]');
      if (cpu || ram) return `${cpu || 'CPU?'}${ram ? ' | ' + ram : ''}`;
    }

    return '';
  }, [containerRef, mode]);

  // ============================
  // SUMMARY STATE
  // ============================
  const [summary, setSummary] = useState(() => {
    try {
      return summaryFromState() || computeFromDOM();
    } catch {
      return '';
    }
  });

  useEffect(() => {
    if (formCtx) {
      setSummary(summaryFromState());
      return;
    }
    setSummary(computeFromDOM());
  }, [
    formCtx
      ? JSON.stringify([formCtx.cliente, formCtx.equipo, formCtx.orden])
      : 'no-form',
    containerRef?.current,
    summaryFromState,
    computeFromDOM,
  ]);

  return summary;
}
