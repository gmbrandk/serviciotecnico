// src/hooks/form-ingreso/useIngresoDiff.js
import { useTiposTrabajo } from '@context/form-ingreso/tiposTrabajoContext';
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
  makeLinea,
}) {
  const { tiposTrabajo } = useTiposTrabajo();

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

  function diffObjectFields(actual = {}, original = {}, opts = {}) {
    const out = [];
    const keys = new Set([
      ...Object.keys(actual || {}),
      ...Object.keys(original || {}),
    ]);
    for (const k of keys) {
      if (opts.filter && !opts.filter(k)) continue;
      if (JSON.stringify(actual[k]) !== JSON.stringify(original[k])) {
        out.push({ field: k, old: original[k], new: actual[k] });
      }
    }
    return out;
  }

  function resolveEstado(lineaActual, lineaOriginal) {
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
  }

  const buildDiff = useCallback(() => {
    const diff = {};
    const orig = originalRef.current || {};

    // cliente
    const clienteFields = diffObjectFields(cliente ?? {}, orig.cliente ?? {});
    if (clienteFields.length > 0) diff.cliente = { fields: clienteFields };

    // equipo
    const equipoFields = diffObjectFields(equipo ?? {}, orig.equipo ?? {});
    if (equipoFields.length > 0) diff.equipo = { fields: equipoFields };

    // tecnico
    const tecnicoFields = diffObjectFields(tecnico ?? {}, orig.tecnico ?? {});
    if (tecnicoFields.length > 0) diff.tecnico = { fields: tecnicoFields };

    // orden campos simples
    const ordenDiff = {};
    const origOrdenRef = orig.orden || {};
    ['diagnosticoCliente', 'observaciones', 'total', 'fechaIngreso'].forEach(
      (k) => {
        if ((orden?.[k] ?? null) !== (origOrdenRef[k] ?? null)) {
          ordenDiff[k] = orden[k];
        }
      }
    );

    // lineasServicio
    const currentLineas = orden.lineasServicio || [];
    const origLineasMap = origOrdenRef.lineas || {};

    const currentMapByUid = {};
    currentLineas.forEach((l) => {
      if (l?.uid) currentMapByUid[l.uid] = l;
    });

    const added = [];
    for (const l of currentLineas) {
      if (!origLineasMap[l.uid]) {
        added.push({
          uid: l.uid,
          descripcion: l.descripcion,
          precioUnitario: Number(l.precioUnitario ?? 0),
          cantidad: Number(l.cantidad ?? 1),
          tipoTrabajo: filtrarCampos(l.tipoTrabajo),
          isNew: !!l.isNew,
          deleted: !!l.deleted,
          errors: l.errors ?? {},
          backendConflict: !!l.backendConflict,
        });
      }
    }

    const removed = [];
    for (const uid of Object.keys(origLineasMap)) {
      if (!currentMapByUid[uid]) removed.push({ uid });
    }

    const modified = [];
    for (const uid of Object.keys(currentMapByUid)) {
      const cur = currentMapByUid[uid];
      const origLine = origLineasMap[uid];
      if (!origLine) continue;

      const estado = resolveEstado(cur, origLine);
      if (estado !== 'clean') {
        const curFiltered = {
          ...cur,
          tipoTrabajo: filtrarCampos(cur.tipoTrabajo),
        };
        const origFiltered = {
          ...origLine,
          tipoTrabajo: filtrarCampos(origLine.tipoTrabajo),
        };

        const changes = diffObjectFields(curFiltered, origFiltered, {
          filter: (f) =>
            !['errors', 'backendConflict', 'isNew', '_fromReset'].includes(f),
        });

        if (changes.length > 0) modified.push({ uid, changes });
      }
    }

    const lineasObj = {};
    if (added.length > 0) lineasObj.added = added;
    if (removed.length > 0) lineasObj.removed = removed.map((r) => r.uid);
    if (modified.length > 0) lineasObj.modified = modified;

    if (Object.keys(lineasObj).length > 0) {
      ordenDiff.lineas = lineasObj;
      diff.lineas = lineasObj;
    }

    if (Object.keys(ordenDiff).length > 0) diff.orden = ordenDiff;

    return diff;
  }, [cliente, equipo, tecnico, orden, originalRef, tiposTrabajo]);

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

  // -----------------------------------------------------------
  // applyDiff con FIX para tipoTrabajo
  // -----------------------------------------------------------
  const applyDiff = useCallback(
    (diff = {}) => {
      if (!diff || Object.keys(diff).length === 0) return;

      if (diff.cliente?.fields) {
        setCliente((prev) => {
          const patch = {};
          for (const f of diff.cliente.fields) patch[f.field] = f.new;
          return { ...(prev ?? {}), ...patch };
        });
      }

      if (diff.equipo?.fields) {
        setEquipo((prev) => {
          const patch = {};
          for (const f of diff.equipo.fields) patch[f.field] = f.new;
          return { ...(prev ?? {}), ...patch };
        });
      }

      if (diff.tecnico?.fields) {
        setTecnico((prev) => {
          const patch = {};
          for (const f of diff.tecnico.fields) patch[f.field] = f.new;
          return { ...(prev ?? {}), ...patch };
        });
      }

      if (diff.orden || diff.lineas) {
        setOrden((prev) => {
          const merged = { ...(prev ?? {}) };

          const ordenSource = diff.orden ?? {};
          [
            'diagnosticoCliente',
            'observaciones',
            'total',
            'fechaIngreso',
          ].forEach((k) => {
            if (Object.prototype.hasOwnProperty.call(ordenSource, k)) {
              merged[k] = ordenSource[k];
            }
          });

          let current = Array.isArray(prev.lineasServicio)
            ? [...prev.lineasServicio]
            : [];

          const rebuildIndex = (arr) => {
            const idx = {};
            arr.forEach((l, i) => {
              if (l?.uid) idx[l.uid] = i;
            });
            return idx;
          };

          let indexByUid = rebuildIndex(current);
          const lineasDiff = ordenSource.lineas ?? diff.lineas ?? {};

          // removed
          if (lineasDiff.removed) {
            for (const uid of lineasDiff.removed) {
              const idx = indexByUid[uid];
              if (idx !== undefined) {
                current.splice(idx, 1);
                indexByUid = rebuildIndex(current);
              }
            }
          }

          // modified (con FIX tipoTrabajo)
          if (lineasDiff.modified) {
            for (const mod of lineasDiff.modified) {
              const idx = indexByUid[mod.uid];
              if (idx !== undefined) {
                const before = current[idx];
                const after = { ...before };

                for (const ch of mod.changes) {
                  if (ch.field === 'tipoTrabajo') {
                    const newVal = ch.new;

                    if (newVal && typeof newVal === 'object') {
                      after.tipoTrabajo = newVal;
                      continue;
                    }

                    if (typeof newVal === 'string') {
                      const norm = newVal.trim().toLowerCase();

                      const found = tiposTrabajo.find(
                        (t) => t.nombre.trim().toLowerCase() === norm
                      );

                      after.tipoTrabajo = found ?? { nombre: newVal };
                      continue;
                    }

                    after.tipoTrabajo = null;
                    continue;
                  }

                  after[ch.field] = ch.new;
                }

                current[idx] = after;
              }
            }
            indexByUid = rebuildIndex(current);
          }

          // added
          if (lineasDiff.added) {
            for (const a of lineasDiff.added) {
              if (indexByUid[a.uid] != null) {
                current[indexByUid[a.uid]] = {
                  ...current[indexByUid[a.uid]],
                  ...a,
                  isNew: !!a.isNew,
                };
              } else {
                const newLine =
                  typeof makeLinea === 'function'
                    ? makeLinea({ ...a, isNew: !!a.isNew })
                    : { ...a };
                current.push(newLine);
              }
              indexByUid = rebuildIndex(current);
            }
          }

          merged.lineasServicio = current;
          return merged;
        });
      }
    },
    [setCliente, setEquipo, setTecnico, setOrden, makeLinea, tiposTrabajo]
  );

  function hasChanges() {
    try {
      return Object.keys(buildDiff()).length > 0;
    } catch {
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
