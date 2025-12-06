// ============================================================
// IngresoFormProvider – versión con AUTOSAVE tipo PATCH + LOGS + DEBUG UI + explainDiff
// ============================================================

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useAutosave } from '@hooks/useAutosave';

// Lookup contexts
import { useClientes } from '@context/form-ingreso/clientesContext';
import { useEquipos } from '@context/form-ingreso/equiposContext';
import { useTecnicos } from '@context/form-ingreso/tecnicosContext';
import { useTiposTrabajo } from '@context/form-ingreso/tiposTrabajoContext';
import { log } from '@utils/form-ingreso/log';

const LS_KEY = 'formIngresoAutosave_v3';
const LS_PERSIST = 'formPersistEnabled_v1';
const EXPIRATION_MS = 3 * 60 * 60 * 1000;

// 🟦 DEBUG PANEL
const DEBUG_UI = true;

const IngresoFormContext = createContext(null);

// ============================================================
// 🟪 explainDiff → para debug
// ============================================================
function explainDiff(actual, original) {
  const diff = {};

  const keys = new Set([
    ...Object.keys(actual || {}),
    ...Object.keys(original || {}),
  ]);

  for (const k of keys) {
    const a = actual?.[k];
    const b = original?.[k];

    if (JSON.stringify(a) !== JSON.stringify(b)) {
      diff[k] = { from: b, to: a };
    }
  }

  return diff;
}

export function IngresoFormProvider({ children, initialPayload = null }) {
  // LOOKUPS
  const { buscarClientePorId } = useClientes();
  const { buscarEquipoPorId } = useEquipos();
  const { buscarTecnicoPorId } = useTecnicos();
  const { buscarTipoTrabajoPorId } = useTiposTrabajo();

  const [loaded, setLoaded] = useState(false);

  const [cliente, setCliente] = useState(null);
  const [equipo, setEquipo] = useState(null);
  const [tecnico, setTecnico] = useState(null);

  const [orden, setOrden] = useState({
    lineasServicio: [],
    diagnosticoCliente: '',
    observaciones: '',
    total: 0,
    fechaIngreso: new Date().toISOString(),
  });

  // ============================================================
  // WHITELIST para TipoTrabajo (solo lo que importa al formulario)
  // ============================================================
  const CAMPOS_TRABAJO = ['_id', 'nombre', 'precioBase', 'categoria', 'activo'];

  // ⭐ ORIGINAL REF
  const originalRef = useRef({
    cliente: null,
    equipo: null,
    tecnico: null,
    orden: { lineas: {} },
  });

  const initialLoadDoneRef = useRef(false);

  // track source of initial load: 'autosave' | 'initialPayload' | 'empty'
  const [initialSource, setInitialSource] = useState('empty');

  // Persistencia
  const [persistEnabled, setPersistEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_PERSIST);
      return saved ? saved === 'true' : true;
    } catch (e) {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LS_PERSIST, persistEnabled);
    } catch (e) {
      /* ignore */
    }
  }, [persistEnabled]);

  // Util: parse respuesta backend
  function extractRecord(res) {
    if (!res) return null;
    if (res.data && typeof res.data === 'object') return res.data;
    if (res.details) {
      const values = Object.values(res.details);
      return values.length === 1 ? values[0] : null;
    }
    if (res._id) return res;
    return null;
  }

  // ============================================================
  // 🔧 Filtrar objeto según whitelist (limpia ruido del backend)
  // ============================================================
  function filtrarCampos(obj, permitidos = CAMPOS_TRABAJO) {
    if (!obj || typeof obj !== 'object') return null;
    const out = {};
    for (const key of permitidos) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) out[key] = obj[key];
    }
    return out;
  }

  // ============================================================
  // makeLinea
  // ============================================================
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

    // Normalizar números silenciosamente
    linea.precioUnitario = Number(linea.precioUnitario ?? 0);
    linea.cantidad = Number(linea.cantidad ?? 1);

    // Filtrar tipoTrabajo
    linea.tipoTrabajo = filtrarCampos(linea.tipoTrabajo);

    return linea;
  }

  // ============================================================
  // loadPayload
  // ============================================================
  async function loadPayload(data) {
    // data is expected to be a full payload (like initialPayload or saved full payload)
    console.log('🟦 PROV:loadPayload →', data);

    // Cliente
    let clienteObj = null;
    if (data.representanteId) {
      clienteObj = extractRecord(
        await buscarClientePorId(data.representanteId)
      );
    } else if (data.cliente?._id) {
      clienteObj = extractRecord(data.cliente);
    }

    // Equipo
    let equipoObj = null;
    if (data.equipoId) {
      equipoObj = extractRecord(await buscarEquipoPorId(data.equipoId));
    } else if (data.equipo?._id) {
      equipoObj = extractRecord(data.equipo);
    }

    const ficha = equipoObj?.fichaTecnicaManual;
    const normalizedEquipo = ficha
      ? {
          ...equipoObj,
          procesador: ficha.cpu ?? '',
          ram: ficha.ram ?? '',
          almacenamiento: ficha.almacenamiento ?? '',
          gpu: ficha.gpu ?? '',
        }
      : equipoObj;

    // Técnico
    let tecnicoObj = null;
    if (data.tecnico) {
      const id =
        typeof data.tecnico === 'string' ? data.tecnico : data.tecnico._id;
      tecnicoObj = extractRecord(await buscarTecnicoPorId(id));
    }

    // Líneas
    const lineasRaw = data.lineasServicio ?? data.orden?.lineasServicio ?? [];
    const lineasServicio = await Promise.all(
      (lineasRaw || []).map(async (l) => {
        let tipoTrabajoObj = null;

        if (l.tipoTrabajo) {
          const idTrabajo =
            typeof l.tipoTrabajo === 'string'
              ? l.tipoTrabajo
              : l.tipoTrabajo._id;
          tipoTrabajoObj = extractRecord(
            await buscarTipoTrabajoPorId(idTrabajo)
          );
        }

        return makeLinea({
          ...l,
          tipoTrabajo: filtrarCampos(tipoTrabajoObj),
          precioUnitario: Number(
            l.precioUnitario ?? tipoTrabajoObj?.precioBase ?? 0
          ),
          cantidad: Number(l.cantidad ?? 1),
          isNew: false,
        });
      })
    );

    const normalizedOrden = {
      lineasServicio,
      diagnosticoCliente:
        data.diagnosticoCliente ?? data.orden?.diagnosticoCliente ?? '',
      observaciones: data.observaciones ?? data.orden?.observaciones ?? '',
      total: Number(data.total ?? data.orden?.total ?? 0),
      fechaIngreso:
        data.fechaIngreso ??
        data.orden?.fechaIngreso ??
        new Date().toISOString(),
    };

    setCliente(clienteObj);
    setEquipo(normalizedEquipo);
    setTecnico(tecnicoObj);
    setOrden(normalizedOrden);

    // ORIGINAL REF
    const mapLineas = {};
    for (const linea of normalizedOrden.lineasServicio) {
      mapLineas[linea.uid] = JSON.parse(JSON.stringify(linea));
    }

    originalRef.current = {
      cliente: JSON.parse(JSON.stringify(clienteObj)),
      equipo: JSON.parse(JSON.stringify(normalizedEquipo)),
      tecnico: JSON.parse(JSON.stringify(tecnicoObj)),
      orden: {
        lineas: mapLineas,
        diagnosticoCliente: normalizedOrden.diagnosticoCliente,
        observaciones: normalizedOrden.observaciones,
        total: normalizedOrden.total,
        fechaIngreso: normalizedOrden.fechaIngreso,
      },
    };

    console.log('🟦 PROV:originalRef SET →', originalRef.current);
  }

  // ============================================================
  // buildDiff → arma patch/minidiff del estado actual respecto al original
  // estructura resultante:
  // { cliente?, equipo?, tecnico?, orden?: { camposSimples?, lineasServicio?: { [uid]: lineaPatch } } }
  // ============================================================
  function buildDiff() {
    const diff = {};

    try {
      // cliente
      if (
        JSON.stringify(cliente) !== JSON.stringify(originalRef.current.cliente)
      ) {
        diff.cliente = cliente;
      }

      // equipo
      if (
        JSON.stringify(equipo) !== JSON.stringify(originalRef.current.equipo)
      ) {
        diff.equipo = equipo;
      }

      // tecnico
      if (
        JSON.stringify(tecnico) !== JSON.stringify(originalRef.current.tecnico)
      ) {
        diff.tecnico = tecnico;
      }

      // orden simples
      const ordenDiff = {};
      const origOrdenRef = originalRef.current?.orden || {};

      ['diagnosticoCliente', 'observaciones', 'total', 'fechaIngreso'].forEach(
        (k) => {
          if ((orden?.[k] ?? null) !== (origOrdenRef[k] ?? null)) {
            ordenDiff[k] = orden[k];
          }
        }
      );

      // lineasServicio -> por uid
      const lineasDiff = {};
      for (const linea of orden.lineasServicio || []) {
        const origLinea = origOrdenRef.lineas?.[linea.uid] ?? null;
        const estado = resolveEstado(linea, origLinea);

        if (estado !== 'clean') {
          // Para simplicidad guardamos la linea completa como patch.
          // Puedes refinar para guardar solo campos cambiados si quieres.
          lineasDiff[linea.uid] = {
            // evita funciones/prototipos peligrosos
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
  }

  // ============================================================
  // applyDiff → aplica un diff (como el generado por buildDiff) sobre el estado actual
  // ============================================================
  function applyDiff(diff = {}) {
    if (!diff) return;

    if (diff.cliente) {
      setCliente(diff.cliente);
    }
    if (diff.equipo) {
      setEquipo(diff.equipo);
    }
    if (diff.tecnico) {
      setTecnico(diff.tecnico);
    }

    if (diff.orden) {
      setOrden((prev) => {
        const updated = { ...prev };

        // campos simples
        [
          'diagnosticoCliente',
          'observaciones',
          'total',
          'fechaIngreso',
        ].forEach((k) => {
          if (Object.prototype.hasOwnProperty.call(diff.orden, k)) {
            updated[k] = diff.orden[k];
          }
        });

        // lineasServicio (patch por uid)
        if (diff.orden.lineasServicio) {
          const byUid = {};
          for (const l of updated.lineasServicio || []) {
            byUid[l.uid] = l;
          }

          // Merge patches
          for (const uid of Object.keys(diff.orden.lineasServicio)) {
            const patch = diff.orden.lineasServicio[uid];

            // normalize tipoTrabajo
            patch.tipoTrabajo = filtrarCampos(patch.tipoTrabajo);

            if (byUid[uid]) {
              // merge into existing linea
              byUid[uid] = { ...byUid[uid], ...patch };
              // normalize numbers
              byUid[uid].precioUnitario = Number(
                byUid[uid].precioUnitario ?? 0
              );
              byUid[uid].cantidad = Number(byUid[uid].cantidad ?? 1);
            } else {
              // new linea: ensure it goes through makeLinea normalization
              const newL = makeLinea({ ...patch, isNew: !!patch.isNew });
              // preserve uid
              newL.uid = patch.uid;
              byUid[uid] = newL;
            }
          }

          // Recreate array preserving original order where possible, append new at end
          const newArray = [];
          const existingUids = new Set(
            (updated.lineasServicio || []).map((l) => l.uid)
          );

          // keep existing order
          for (const l of updated.lineasServicio || []) {
            if (byUid[l.uid]) newArray.push(byUid[l.uid]);
          }

          // append any new uids that weren't in the previous list
          for (const uid of Object.keys(byUid)) {
            if (!existingUids.has(uid)) newArray.push(byUid[uid]);
          }

          updated.lineasServicio = newArray;
        }

        return updated;
      });
    }
  }

  // ============================================================
  // Autosave hook: ahora guarda buildDiff() en vez del estado completo
  // Nota: colocamos el hook después de buildDiff/applyDiff.
  // ============================================================
  const autosaveValue = useMemo(
    () => buildDiff(),
    [cliente, equipo, tecnico, orden]
  );

  const autosaveReady = initialLoadDoneRef.current; // sólo después de la carga inicial

  const autosave = useAutosave({
    key: LS_KEY,
    value: autosaveValue,
    enabled: persistEnabled && autosaveReady,
    delay: 300,
    skipInitialSave: true,
  });

  // utilidad: si hay cambios pendientes
  function hasChanges() {
    try {
      return Object.keys(buildDiff()).length > 0;
    } catch (e) {
      return false;
    }
  }

  // utilidad: eliminar autosave del localStorage
  function discardAutosave() {
    try {
      localStorage.removeItem(LS_KEY);
      // opcional: reset initialSource to prefer backend next time
      setInitialSource('empty');
      console.log('🗑️ AUTOSAVE descartado');
    } catch (e) {
      console.warn('No se pudo descartar autosave', e);
    }
  }

  // ============================================================
  // 🔄 CARGA INICIAL
  // ============================================================
  useEffect(() => {
    if (loaded) return;

    console.log('🟦 PROV:LOAD → Inicializando carga inicial');

    const saved = autosave.load(); // puede ser { timestamp, diff } o un payload completo

    // ----> 1) Preferimos AUTOSAVE si es reciente
    if (saved && Date.now() - saved.timestamp < EXPIRATION_MS) {
      console.log('🟦 PROV:LOAD → usando autosave');

      // Si el saved contiene diff (nuestro esquema)
      if (saved.diff && Object.keys(saved.diff).length > 0) {
        setInitialSource('autosave');
        // Load backend / initialPayload first (if exists) to have base to patch
        (async () => {
          await loadPayload(initialPayload ?? {});
          applyDiff(saved.diff);
        })();
      } else {
        // si guarda payload completo (legacy) lo aceptamos directamente
        setInitialSource('autosave');
        (async () => {
          await loadPayload(saved);
        })();
      }
    }

    // ----> 2) Si no hay autosave válido, usamos initialPayload
    else if (initialPayload) {
      console.log('🟦 PROV:LOAD → usando initialPayload');
      setInitialSource('initialPayload');
      (async () => {
        await loadPayload(initialPayload);
      })();
    }

    // ----> 3) Nada disponible → formulario vacío
    else {
      console.log('🟦 PROV:LOAD → sin autosave ni initialPayload');
      setInitialSource('empty');
      // load empty/defaults via loadPayload({})
      (async () => {
        await loadPayload({});
      })();
    }

    setLoaded(true);
    autosave.markReady();
    initialLoadDoneRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================================
  // Recalcular total
  // ============================================================
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
  }, [orden.lineasServicio]);

  // ============================================================
  // Helpers de líneas
  // ============================================================
  const addLinea = () => {
    console.log('🟧 LINEA:add');
    setOrden((prev) => ({
      ...prev,
      lineasServicio: [...prev.lineasServicio, makeLinea()],
    }));
  };

  const deleteLinea = (index) => {
    console.log('🟧 LINEA:delete', index);
    setOrden((prev) => ({
      ...prev,
      lineasServicio: prev.lineasServicio.filter((_, i) => i !== index),
    }));
  };

  const updateLinea = (index, patchOrFn) =>
    setOrden((prev) => {
      const lineas = [...prev.lineasServicio];
      const current = lineas[index];
      const next =
        typeof patchOrFn === 'function'
          ? patchOrFn(current)
          : { ...current, ...patchOrFn };

      console.log('🟧 LINEA:update', { index, patch: patchOrFn, result: next });

      lineas[index] = next;
      return { ...prev, lineasServicio: lineas };
    });

  const resetLinea = (index) => {
    const lineaActual = orden.lineasServicio[index];
    if (!lineaActual) return;

    const uid = lineaActual.uid;
    const orig = originalRef.current?.orden?.lineas?.[uid];

    if (!orig) return;

    console.log('🟧 LINEA:reset', index);

    updateLinea(index, {
      ...JSON.parse(JSON.stringify(orig)),
      isNew: false,
      deleted: false,
      backendConflict: false,
      errors: {},
      _fromReset: true,
    });
  };

  // ============================================================
  // Detectar modificado
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

  // ============================================================
  // resolveEstado
  // ============================================================
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

    log('🟨 ESTADO', {
      uid: lineaActual.uid,
      estado,
      diff,
      isNew: lineaActual.isNew,
      deleted: lineaActual.deleted,
    });

    return estado;
  }

  // ============================================================
  // Panel Debug UI
  // ============================================================
  const debugPanel = (() => {
    if (!DEBUG_UI) return null;
    if (!orden.lineasServicio) return null;

    const counters = {
      new: 0,
      modified: 0,
      clean: 0,
      deleted: 0,
      conflict: 0,
      error: 0,
    };

    orden.lineasServicio.forEach((l) => {
      const orig = originalRef.current?.orden?.lineas?.[l.uid] ?? null;
      const est = resolveEstado(l, orig);
      counters[est]++;
    });

    return (
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '12px',
          background: '#222',
          color: 'white',
          borderRadius: '8px',
          zIndex: 9999,
          fontSize: '12px',
        }}
      >
        <div>🔍 DEBUG UI</div>
        <div>Source: {initialSource}</div>
        <div>New: {counters.new}</div>
        <div>Modified: {counters.modified}</div>
        <div>Clean: {counters.clean}</div>
        <div>Conflict: {counters.conflict}</div>
        <div>Deleted: {counters.deleted}</div>
        <div>Error: {counters.error}</div>

        <button
          style={{ marginTop: '8px', padding: '4px 6px' }}
          onClick={() => {
            console.log('🟪 DIFF:GLOBAL →', {
              actual: orden.lineasServicio,
              original: originalRef.current,
              autosaveDiff: buildDiff(),
            });
          }}
        >
          Print DIFF
        </button>

        <button
          style={{ marginTop: '8px', padding: '4px 6px' }}
          onClick={() => {
            console.log('🗑️ Discarding autosave and reloading original');
            discardAutosave();
            // re-load originalRef into state
            (async () => {
              await loadPayload({});
              // reset originalRef into state (if originalRef had been set earlier you'd call loadPayload with original source)
            })();
          }}
        >
          Discard Autosave
        </button>
      </div>
    );
  })();

  // ============================================================
  // Provider
  // ============================================================
  return (
    <IngresoFormContext.Provider
      value={{
        // state
        cliente,
        setCliente,
        equipo,
        setEquipo,
        tecnico,
        setTecnico,
        orden,
        setOrden,

        // line helpers
        addLinea,
        deleteLinea,
        updateLinea,
        resetLinea,
        makeLinea,

        // diff / autosave
        buildDiff,
        hasChanges,
        applyDiff,
        discardAutosave,
        initialSource,

        // other helpers
        resolveEstado,
        originalRef,
        explainDiff,

        // persistence
        persistEnabled,
        setPersistEnabled,
        autosave,
        autosaveReady,
        loaded,
      }}
    >
      {children}
      {debugPanel}
    </IngresoFormContext.Provider>
  );
}

export const useIngresoForm = () => useContext(IngresoFormContext);
