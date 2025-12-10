// src/hooks/form-ingreso/useIngresoDiff.js
import { useCallback } from 'react';

export default function useIngresoDiff({
  cliente,
  equipo,
  tecnico,
  orden,
  setCliente,
  setEquipo,
  setTecnico,
  setOrden,
  originalRef,
}) {
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

  const explainDiff = useCallback((actual, original) => {
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
  }, []);

  const resolveEstado = (lineaActual, lineaOriginal) => {
    const aTT = filtrarCampos(lineaActual.tipoTrabajo);
    const oTT = filtrarCampos(lineaOriginal?.tipoTrabajo);

    const modified = !lineaOriginal
      ? lineaActual.isNew
      : lineaActual.descripcion !== lineaOriginal.descripcion ||
        Number(lineaActual.precioUnitario) !==
          Number(lineaOriginal.precioUnitario) ||
        Number(lineaActual.cantidad) !== Number(lineaOriginal.cantidad) ||
        JSON.stringify(aTT) !== JSON.stringify(oTT);

    return lineaActual.errors && Object.keys(lineaActual.errors).length
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
  };

  const buildDiff = useCallback(() => {
    const diff = {};
    try {
      if (
        JSON.stringify(cliente) !== JSON.stringify(originalRef.current.cliente)
      ) {
        diff.cliente = cliente;
      }
      if (
        JSON.stringify(equipo) !== JSON.stringify(originalRef.current.equipo)
      ) {
        diff.equipo = equipo;
      }
      if (
        JSON.stringify(tecnico) !== JSON.stringify(originalRef.current.tecnico)
      ) {
        diff.tecnico = tecnico;
      }

      const ordenDiff = {};
      const origOrdenRef = originalRef.current?.orden || {};

      ['diagnosticoCliente', 'observaciones', 'total', 'fechaIngreso'].forEach(
        (k) => {
          if ((orden?.[k] ?? null) !== (origOrdenRef[k] ?? null)) {
            ordenDiff[k] = orden[k];
          }
        }
      );

      const lineasDiff = {};
      for (const linea of orden.lineasServicio || []) {
        const origLinea = origOrdenRef.lineasServicio?.[linea.uid] ?? null;

        const estado = resolveEstado(linea, origLinea);
        if (estado !== 'clean') {
          lineasDiff[linea.uid] = {
            uid: linea.uid,
            descripcion: linea.descripcion,
            precioUnitario: Number(linea.precioUnitario ?? 0),
            cantidad: Number(linea.cantidad ?? 1),
            tipoTrabajo: filtrarCampos(linea.tipoTrabajo),
            isNew: linea.isNew,
            deleted: linea.deleted,
            errors: linea.errors,
            backendConflict: linea.backendConflict,
          };
        }
      }

      if (Object.keys(lineasDiff).length > 0) {
        ordenDiff.lineasServicio = lineasDiff;
      }

      if (Object.keys(ordenDiff).length > 0) {
        diff.orden = ordenDiff;
      }
    } catch (e) {
      console.error('Error building diff', e);
    }
    return diff;
  }, [cliente, equipo, tecnico, orden, originalRef]);

  // -----------------------------------------------------------
  // 🔥 applyDiff REAL y funcional
  // -----------------------------------------------------------
  const applyDiff = useCallback(
    (diff = {}) => {
      if (!diff || Object.keys(diff).length === 0) return;

      if (diff.cliente) setCliente(diff.cliente);
      if (diff.equipo) setEquipo(diff.equipo);
      if (diff.tecnico) setTecnico(diff.tecnico);

      if (diff.orden) {
        setOrden((prev) => {
          const merged = { ...prev, ...diff.orden };

          // merge de lineas por UID
          if (diff.orden.lineasServicio) {
            const copy = { ...(prev.lineasServicio ?? {}) };

            for (const uid of Object.keys(diff.orden.lineasServicio)) {
              copy[uid] = {
                ...(copy[uid] ?? {}),
                ...diff.orden.lineasServicio[uid],
              };
            }

            merged.lineasServicio = copy;
          }

          return merged;
        });
      }
    },
    [setCliente, setEquipo, setTecnico, setOrden]
  );

  function hasChanges() {
    try {
      return Object.keys(buildDiff()).length > 0;
    } catch (e) {
      return false;
    }
  }

  return {
    buildDiff,
    hasChanges,
    applyDiff,
    explainDiff,
  };
}
