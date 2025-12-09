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

// explainDiff (igual) — con log cada vez que se calcula para trazabilidad
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

  // Log ligero para ver qué keys cambiaron en este diff
  console.debug('🟩 explainDiff → cambios detectados:', {
    changedKeys: Object.keys(diff),
    diffPreview: Object.keys(diff)
      .slice(0, 10)
      .reduce((acc, key) => {
        acc[key] = diff[key];
        return acc;
      }, {}),
  });

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

  const CAMPOS_TRABAJO = ['_id', 'nombre', 'precioBase', 'categoria', 'activo'];

  const originalRef = useRef({
    cliente: null,
    equipo: null,
    tecnico: null,
    orden: { lineas: {} },
  });

  const initialLoadDoneRef = useRef(false);
  const [initialSource, setInitialSource] = useState('empty');

  console.log('PARENT → initialPayload enviado al provider:', initialPayload);

  const [persistEnabled, setPersistEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_PERSIST);
      const val = saved ? saved === 'true' : true;
      console.debug('🟦 PersistEnabled inicial leído de localStorage:', {
        raw: saved,
        interpreted: val,
      });
      return val;
    } catch (e) {
      console.warn(
        '🟦 persistEnabled: error leyendo localStorage, usando true por defecto',
        e
      );
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LS_PERSIST, persistEnabled);
      console.debug(
        '🟦 persistEnabled guardado en localStorage:',
        persistEnabled
      );
    } catch (e) {
      console.warn('🟦 persistEnabled: no se pudo guardar en localStorage', e);
    }
  }, [persistEnabled]);

  // Utilidad: extraer un "record" de distintas formas de respuesta
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

  function filtrarCampos(obj, permitidos = CAMPOS_TRABAJO) {
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

  async function loadPayload(data) {
    console.info('🟦 PROV:loadPayload → inicio', {
      reason:
        'cargar payload (puede venir de initialPayload o autosave completo)',
      payloadSummary:
        data && typeof data === 'object'
          ? {
              hasLineas: Boolean(
                data.lineasServicio || data.orden?.lineasServicio
              ),
              keys: Object.keys(data),
            }
          : data,
    });

    let clienteObj = null;
    if (data.representanteId) {
      console.debug(
        '🟦 loadPayload → representanteId presente:',
        data.representanteId
      );
      clienteObj = extractRecord(
        await buscarClientePorId(data.representanteId)
      );
      console.debug(
        '🟦 loadPayload → cliente recuperado por representanteId:',
        clienteObj?._id ?? null
      );
    } else if (data.cliente?._id) {
      console.debug(
        '🟦 loadPayload → cliente embebido en payload:',
        data.cliente._id
      );
      clienteObj = extractRecord(data.cliente);
    } else {
      console.debug('🟦 loadPayload → no hay cliente en payload');
    }

    let equipoObj = null;
    if (data.equipoId) {
      console.debug('🟦 loadPayload → equipoId presente:', data.equipoId);
      equipoObj = extractRecord(await buscarEquipoPorId(data.equipoId));
      console.debug(
        '🟦 loadPayload → equipo recuperado por id:',
        equipoObj?._id ?? null
      );
    } else if (data.equipo?._id) {
      console.debug(
        '🟦 loadPayload → equipo embebido en payload:',
        data.equipo._id
      );
      equipoObj = extractRecord(data.equipo);
    } else {
      console.debug('🟦 loadPayload → no hay equipo en payload');
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

    if (ficha) {
      console.debug('🟦 loadPayload → equipo normalizado desde ficha técnica', {
        originalEquipoId: equipoObj?._id,
        normalizedKeys: Object.keys(normalizedEquipo || {}),
      });
    }

    let tecnicoObj = null;
    if (data.tecnico) {
      const id =
        typeof data.tecnico === 'string' ? data.tecnico : data.tecnico._id;
      console.debug('🟦 loadPayload → técnico referenciado en payload:', id);
      tecnicoObj = extractRecord(await buscarTecnicoPorId(id));
      console.debug(
        '🟦 loadPayload → técnico recuperado:',
        tecnicoObj?._id ?? null
      );
    } else {
      console.debug('🟦 loadPayload → no hay técnico en payload');
    }

    const lineasRaw = data.lineasServicio ?? data.orden?.lineasServicio ?? [];
    console.debug(
      '🟦 loadPayload → número de líneas recibidas (raw):',
      (lineasRaw || []).length
    );

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

        const result = makeLinea({
          ...l,
          tipoTrabajo: filtrarCampos(tipoTrabajoObj),
          precioUnitario: Number(
            l.precioUnitario ?? tipoTrabajoObj?.precioBase ?? 0
          ),
          cantidad: Number(l.cantidad ?? 1),
          isNew: false,
        });

        // Log por línea para trazabilidad de origen/precios
        console.debug('🟦 loadPayload → processed linea', {
          uid: result.uid,
          precioUnitario: result.precioUnitario,
          cantidad: result.cantidad,
          tipoTrabajoId: tipoTrabajoObj?._id ?? null,
          isNew: result.isNew,
        });

        return result;
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

    console.info('🟦 loadPayload → orden normalizada calculada', {
      lineasCount: normalizedOrden.lineasServicio.length,
      total: normalizedOrden.total,
      fechaIngreso: normalizedOrden.fechaIngreso,
    });

    setCliente(clienteObj);
    setEquipo(normalizedEquipo);
    setTecnico(tecnicoObj);
    setOrden(normalizedOrden);

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

    console.info('🟦 PROV:originalRef SET → referencia original guardada', {
      clienteId: originalRef.current.cliente?._id ?? null,
      equipoId: originalRef.current.equipo?._id ?? null,
      tecnicoId: originalRef.current.tecnico?._id ?? null,
      lineasOriginalCount: Object.keys(originalRef.current.orden.lineas).length,
    });
  }

  function buildDiff() {
    const diff = {};

    try {
      if (
        JSON.stringify(cliente) !== JSON.stringify(originalRef.current.cliente)
      ) {
        diff.cliente = cliente;
        console.debug('🟦 buildDiff → cliente modificado', {
          current: cliente,
          original: originalRef.current.cliente,
        });
      }

      if (
        JSON.stringify(equipo) !== JSON.stringify(originalRef.current.equipo)
      ) {
        diff.equipo = equipo;
        console.debug('🟦 buildDiff → equipo modificado', {
          current: equipo,
          original: originalRef.current.equipo,
        });
      }

      if (
        JSON.stringify(tecnico) !== JSON.stringify(originalRef.current.tecnico)
      ) {
        diff.tecnico = tecnico;
        console.debug('🟦 buildDiff → tecnico modificado', {
          current: tecnico,
          original: originalRef.current.tecnico,
        });
      }

      const ordenDiff = {};
      const origOrdenRef = originalRef.current?.orden || {};

      ['diagnosticoCliente', 'observaciones', 'total', 'fechaIngreso'].forEach(
        (k) => {
          if ((orden?.[k] ?? null) !== (origOrdenRef[k] ?? null)) {
            ordenDiff[k] = orden[k];
            console.debug('🟦 buildDiff → orden campo modificado', {
              campo: k,
              valor: orden[k],
              original: origOrdenRef[k],
            });
          }
        }
      );

      const lineasDiff = {};
      for (const linea of orden.lineasServicio || []) {
        const origLinea = origOrdenRef.lineas?.[linea.uid] ?? null;
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
          console.debug(
            '🟦 buildDiff → linea con estado != clean añadida al diff',
            {
              uid: linea.uid,
              estado,
            }
          );
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

    // Log final del diff (resumen)
    console.debug('🟦 buildDiff → diff final construido', {
      diffKeys: Object.keys(diff),
      totalLineaChanges: diff.orden?.lineasServicio
        ? Object.keys(diff.orden.lineasServicio).length
        : 0,
    });

    return diff;
  }

  function applyDiff(diff = {}) {
    if (!diff) {
      console.debug('🟦 applyDiff → diff vacío o nulo, nada que aplicar');
      return;
    }

    console.info('🟦 applyDiff → inicio aplicación de diff', {
      diffKeys: Object.keys(diff),
      diffPreview: Object.keys(diff)
        .slice(0, 10)
        .reduce((acc, key) => {
          acc[key] = diff[key];
          return acc;
        }, {}),
    });

    if (diff.cliente) {
      console.debug(
        '🟦 applyDiff → aplicando cliente',
        diff.cliente?._id ?? null
      );
      setCliente(diff.cliente);
    }
    if (diff.equipo) {
      console.debug(
        '🟦 applyDiff → aplicando equipo',
        diff.equipo?._id ?? null
      );
      setEquipo(diff.equipo);
    }
    if (diff.tecnico) {
      console.debug(
        '🟦 applyDiff → aplicando tecnico',
        diff.tecnico?._id ?? null
      );
      setTecnico(diff.tecnico);
    }

    if (diff.orden) {
      setOrden((prev) => {
        const updated = { ...prev };

        [
          'diagnosticoCliente',
          'observaciones',
          'total',
          'fechaIngreso',
        ].forEach((k) => {
          if (Object.prototype.hasOwnProperty.call(diff.orden, k)) {
            console.debug(
              '🟦 applyDiff → aplicando campo orden:',
              k,
              'valor:',
              diff.orden[k]
            );
            updated[k] = diff.orden[k];
          }
        });

        if (diff.orden.lineasServicio) {
          const byUid = {};
          for (const l of updated.lineasServicio || []) {
            byUid[l.uid] = l;
          }

          for (const uid of Object.keys(diff.orden.lineasServicio)) {
            const patch = diff.orden.lineasServicio[uid];
            patch.tipoTrabajo = filtrarCampos(patch.tipoTrabajo);

            if (byUid[uid]) {
              console.debug(
                '🟦 applyDiff → parchando linea existente uid=',
                uid
              );
              byUid[uid] = { ...byUid[uid], ...patch };
              byUid[uid].precioUnitario = Number(
                byUid[uid].precioUnitario ?? 0
              );
              byUid[uid].cantidad = Number(byUid[uid].cantidad ?? 1);
            } else {
              console.debug(
                '🟦 applyDiff → creando nueva linea desde diff uid=',
                uid
              );
              const newL = makeLinea({ ...patch, isNew: !!patch.isNew });
              newL.uid = patch.uid;
              byUid[uid] = newL;
            }
          }

          const newArray = [];
          const existingUids = new Set(
            (updated.lineasServicio || []).map((l) => l.uid)
          );
          for (const l of updated.lineasServicio || []) {
            if (byUid[l.uid]) newArray.push(byUid[l.uid]);
          }
          for (const uid of Object.keys(byUid)) {
            if (!existingUids.has(uid)) newArray.push(byUid[uid]);
          }

          console.debug(
            '🟦 applyDiff → reconstruyendo array de lineas, total:',
            newArray.length
          );
          updated.lineasServicio = newArray;
        }

        return updated;
      });
    }
  }

  const autosaveValue = useMemo(
    () => buildDiff(),
    [cliente, equipo, tecnico, orden]
  );

  const autosaveReady = initialLoadDoneRef.current;

  const autosave = useAutosave({
    key: LS_KEY,
    value: autosaveValue,
    enabled: persistEnabled && autosaveReady,
    delay: 300,
    skipInitialSave: true,
  });

  function hasChanges() {
    try {
      const changed = Object.keys(buildDiff()).length > 0;
      console.debug('🟦 hasChanges →', changed);
      return changed;
    } catch (e) {
      console.warn('🟦 hasChanges → error determinando cambios', e);
      return false;
    }
  }

  function discardAutosave() {
    try {
      localStorage.removeItem(LS_KEY);
      setInitialSource('empty');
      console.info(
        '🗑️ AUTOSAVE descartado — clave removida de localStorage:',
        LS_KEY
      );
    } catch (e) {
      console.warn('No se pudo descartar autosave', e);
    }
  }

  // ============================================================
  // CARGA INICIAL (FIXED: marcar loaded/autosave sólo después de cada ruta async)
  // ============================================================
  useEffect(() => {
    if (loaded) {
      console.debug('🟦 PROV:LOAD → ya cargado, saliendo del efecto inicial');
      return;
    }

    console.info('🟦 PROV:LOAD → Inicializando carga inicial del form');

    const saved = autosave.load(); // puede ser { timestamp, diff } o un payload completo
    console.debug(
      '🟦 PROV:LOAD → autosave.load() result:',
      saved
        ? {
            hasTimestamp: !!saved.timestamp,
            keys: Object.keys(saved).slice(0, 10),
          }
        : null
    );

    // Helper para finalizar proceso de carga
    const finalizeLoad = () => {
      setLoaded(true);
      try {
        autosave.markReady();
        console.debug('🟦 PROV:LOAD → autosave.markReady() llamado');
      } catch (e) {
        // markReady puede no existir en implementaciones alternativas; atrapamos
        console.warn('autosave.markReady falló', e);
      }
      initialLoadDoneRef.current = true;
      console.info(
        '🟦 PROV:LOAD → carga inicial finalizada, initialLoadDoneRef=true, loaded=true'
      );
    };

    // ----> 1) Preferimos AUTOSAVE si es reciente
    if (saved && Date.now() - saved.timestamp < EXPIRATION_MS) {
      console.info(
        '🟦 PROV:LOAD → autosave reciente encontrada, se usará si es aplicable'
      );
      console.debug(
        '🟦 PROV:LOAD → autosave.timestamp',
        new Date(saved.timestamp).toISOString()
      );

      if (saved.diff && Object.keys(saved.diff).length > 0) {
        setInitialSource('autosave');
        (async () => {
          console.debug(
            '🟦 PROV:LOAD → autosave contiene diff (parcial). Cargando payload base y aplicando diff.'
          );
          await loadPayload(initialPayload ?? {});
          applyDiff(saved.diff);
          finalizeLoad();
        })();
      } else {
        setInitialSource('autosave');
        (async () => {
          console.debug(
            '🟦 PROV:LOAD → autosave contiene payload completo. Cargando directamente desde autosave.'
          );
          await loadPayload(saved);
          finalizeLoad();
        })();
      }

      return;
    }

    // ----> 2) Si no hay autosave válido, usamos initialPayload
    if (initialPayload) {
      console.info(
        '🟦 PROV:LOAD → no hay autosave válido, usando initialPayload provisto por la ruta'
      );
      setInitialSource('initialPayload');
      (async () => {
        await loadPayload(initialPayload);
        finalizeLoad();
      })();
      return;
    }

    // ----> 3) Nada disponible → formulario vacío
    console.info(
      '🟦 PROV:LOAD → sin autosave ni initialPayload, inicializando formulario vacío'
    );
    setInitialSource('empty');
    (async () => {
      await loadPayload({});
      finalizeLoad();
    })();
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
      console.debug(
        '🟦 Recalculando total — antes:',
        orden.total,
        'ahora:',
        total
      );
      setOrden((prev) => ({ ...prev, total }));
    }
  }, [orden.lineasServicio]);

  // Helpers de líneas (igual) — con logs detallados
  const addLinea = () => {
    console.info('🟧 LINEA:add → añadiendo línea nueva (isNew=true)');
    setOrden((prev) => ({
      ...prev,
      lineasServicio: [...prev.lineasServicio, makeLinea()],
    }));
  };

  const deleteLinea = (index) => {
    console.info('🟧 LINEA:delete → eliminando línea (por índice)', index);
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

      console.info(
        '🟧 LINEA:update → índice:',
        index,
        'parche:',
        patchOrFn,
        'resultado.uid:',
        next?.uid
      );
      lineas[index] = next;
      return { ...prev, lineasServicio: lineas };
    });

  const resetLinea = (index) => {
    const lineaActual = orden.lineasServicio[index];
    if (!lineaActual) {
      console.debug('🟧 LINEA:reset → no existe línea en índice', index);
      return;
    }

    const uid = lineaActual.uid;
    const orig = originalRef.current?.orden?.lineas?.[uid];

    if (!orig) {
      console.debug('🟧 LINEA:reset → no existe línea original para uid', uid);
      return;
    }

    console.info('🟧 LINEA:reset → reseteando línea index/uid:', index, uid);

    updateLinea(index, {
      ...JSON.parse(JSON.stringify(orig)),
      isNew: false,
      deleted: false,
      backendConflict: false,
      errors: {},
      _fromReset: true,
    });
  };

  function isModified(actual, original) {
    if (!original) {
      // Si no hay original, consideramos modificado si actual.isNew === true
      return actual.isNew;
    }

    const aTT = filtrarCampos(actual.tipoTrabajo);
    const oTT = filtrarCampos(original.tipoTrabajo);

    return (
      actual.descripcion !== original.descripcion ||
      Number(actual.precioUnitario) !== Number(original.precioUnitario) ||
      Number(actual.cantidad) !== Number(original.cantidad) ||
      JSON.stringify(aTT) !== JSON.stringify(oTT)
    );
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

    // Log muy descriptivo por cada evaluación de estado
    log('🟨 ESTADO', {
      uid: lineaActual.uid,
      estado,
      reason: {
        hasErrors: Boolean(
          lineaActual.errors && Object.keys(lineaActual.errors).length
        ),
        deleted: lineaActual.deleted,
        backendConflict: lineaActual.backendConflict,
        isNew: lineaActual.isNew,
        modified,
      },
      diffPreview: Object.keys(diff).length ? diff : null,
    });

    return estado;
  }

  // Debug panel (igual) — con botón que imprime diff global
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
            (async () => {
              await loadPayload({});
            })();
          }}
        >
          Discard Autosave
        </button>
      </div>
    );
  })();

  return (
    <IngresoFormContext.Provider
      value={{
        cliente,
        setCliente,
        equipo,
        setEquipo,
        tecnico,
        setTecnico,
        orden,
        setOrden,

        addLinea,
        deleteLinea,
        updateLinea,
        resetLinea,
        makeLinea,

        buildDiff,
        hasChanges,
        applyDiff,
        discardAutosave,
        initialSource,

        resolveEstado,
        originalRef,
        explainDiff,

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
