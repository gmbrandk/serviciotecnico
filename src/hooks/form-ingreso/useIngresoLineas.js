// src\hooks\form-ingreso\useIngresoLineas.js
import { useCallback, useEffect } from 'react';

export default function useIngresoLineas({ orden, setOrden, originalRef }) {
  // makeLinea helper (if needed externally)
  function filtrarCampos(
    obj,
    permitidos = ['_id', 'nombre', 'precioBase', 'categoria', 'activo']
  ) {
    if (!obj || typeof obj !== 'object') return null;
    const out = {};
    for (const key of permitidos) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) out[key] = obj[key];
    }
    return out;
  }

  function makeLinea(l = {}) {
    const base = {
      uid: crypto.randomUUID(),
      descripcion: '',
      precioUnitario: 0,
      cantidad: 1,
      isNew: true,
      deleted: false,
      errors: {},
      backendConflict: false,
    };

    const linea = { ...base, ...l };
    linea.precioUnitario = Number(linea.precioUnitario ?? 0);
    linea.cantidad = Number(linea.cantidad ?? 1);
    linea.tipoTrabajo = filtrarCampos(linea.tipoTrabajo);
    return linea;
  }

  const addLinea = useCallback(() => {
    setOrden((prev) => ({
      ...prev,
      lineasServicio: [...prev.lineasServicio, makeLinea()],
    }));
  }, [setOrden]);

  const deleteLinea = useCallback(
    (index) => {
      setOrden((prev) => ({
        ...prev,
        lineasServicio: prev.lineasServicio.filter((_, i) => i !== index),
      }));
    },
    [setOrden]
  );

  const updateLinea = useCallback(
    (index, patchOrFn) =>
      setOrden((prev) => {
        const lineas = [...prev.lineasServicio];
        const current = lineas[index];
        const next =
          typeof patchOrFn === 'function'
            ? patchOrFn(current)
            : { ...current, ...patchOrFn };
        lineas[index] = next;
        return { ...prev, lineasServicio: lineas };
      }),
    [setOrden]
  );

  const resetLinea = useCallback(
    (index) => {
      const lineaActual = orden.lineasServicio[index];
      if (!lineaActual) return;
      const uid = lineaActual.uid;
      const orig = originalRef.current?.orden?.lineas?.[uid];
      if (!orig) return;
      updateLinea(index, {
        ...JSON.parse(JSON.stringify(orig)),
        isNew: false,
        deleted: false,
        backendConflict: false,
        errors: {},
        _fromReset: true,
      });
    },
    [orden.lineasServicio, originalRef, updateLinea]
  );

  // recalculate total when lineas change
  useEffect(() => {
    if (!orden.lineasServicio) return;
    const total = orden.lineasServicio.reduce(
      (acc, l) =>
        acc + (Number(l.precioUnitario) || 0) * (Number(l.cantidad) || 0),
      0
    );
    if (total !== orden.total) {
      setOrden((prev) => ({ ...prev, total }));
    }
  }, [orden.lineasServicio, orden.total, setOrden]);

  function isModified(actual, original) {
    if (!original) return actual.isNew;
    const aTT = filtrarCampos(actual.tipoTrabajo);
    const oTT = filtrarCampos(original.tipoTrabajo);
    return (
      actual.descripcion !== original.descripcion ||
      Number(actual.precioUnitario) !== Number(original.precioUnitario) ||
      Number(actual.cantidad) !== Number(original.cantidad) ||
      JSON.stringify(aTT) !== JSON.stringify(oTT)
    );
  }

  function explainDiff(actual, original) {
    const diff = {};
    const keys = new Set([
      ...Object.keys(actual || {}),
      ...Object.keys(original || {}),
    ]);
    for (const k of keys) {
      const a = actual?.[k];
      const b = original?.[k];
      if (JSON.stringify(a) !== JSON.stringify(b)) diff[k] = { from: b, to: a };
    }
    return diff;
  }

  function resolveEstado(lineaActual, lineaOriginal) {
    const aTT = filtrarCampos(lineaActual.tipoTrabajo);
    const oTT = filtrarCampos(lineaOriginal?.tipoTrabajo);
    const diff = explainDiff(
      { ...lineaActual, tipoTrabajo: aTT },
      { ...lineaOriginal, tipoTrabajo: oTT }
    );
    const modified = isModified(lineaActual, lineaOriginal);
    const estado =
      lineaActual.errors && Object.keys(lineaActual.errors).length
        ? 'error'
        : lineaActual.deleted
        ? 'deleted'
        : lineaActual.backendConflict
        ? 'conflict'
        : lineaActual.isNew
        ? 'new'
        : modified
        ? 'modified'
        : 'clean';

    return estado;
  }

  return {
    makeLinea,
    addLinea,
    deleteLinea,
    updateLinea,
    resetLinea,
    resolveEstado,
    explainDiff,
  };
}
