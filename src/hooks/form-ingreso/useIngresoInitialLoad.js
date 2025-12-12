// 🔥 VERSIÓN DEPURADA — SIN AUTOSAVE LEGACY

import { useClientes } from '@context/form-ingreso/clientesContext';
import { useEquipos } from '@context/form-ingreso/equiposContext';
import { useTecnicos } from '@context/form-ingreso/tecnicosContext';
import { useTiposTrabajo } from '@context/form-ingreso/tiposTrabajoContext';
import { generarUidLinea } from '@utils/uidLinea';
import { useEffect, useRef, useState } from 'react';

/*───────────────────────────────────────────────
  🔧 UTILIDADES
────────────────────────────────────────────────*/
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

/*───────────────────────────────────────────────
  ⭐ HOOK PRINCIPAL (DEPURADO)
────────────────────────────────────────────────*/
export default function useIngresoInitialLoad({ initialPayload = null }) {
  const { buscarClientePorId } = useClientes();
  const { buscarEquipoPorId } = useEquipos();
  const { buscarTecnicoPorId } = useTecnicos();
  const { buscarTipoTrabajoPorId } = useTiposTrabajo();

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

  const [loaded, setLoaded] = useState(false);
  const [initialSource, setInitialSource] = useState('empty');

  const initOnce = useRef(false);
  const loadingPayloadRef = useRef(false);
  const originalRef = useRef({
    cliente: null,
    equipo: null,
    tecnico: null,
    orden: { lineas: {} },
  });

  /*───────────────────────────────────────────────
    🧱 Construcción de línea
  ───────────────────────────────────────────────*/
  function makeLinea(l = {}) {
    // uid estable: preferimos l.uid, luego l._id (backend), si no existe generamos uno

    const uid = l.uid || l._id || generarUidLinea();

    return {
      uid,
      descripcion: l.descripcion ?? '',
      precioUnitario: Number(l.precioUnitario ?? 0),
      cantidad: Number(l.cantidad ?? 1),
      tipoTrabajo: filtrarCampos(l.tipoTrabajo),
      isNew: typeof l.isNew === 'boolean' ? l.isNew : l._id ? false : true,
      deleted: typeof l.deleted === 'boolean' ? l.deleted : false,
      errors: l.errors ?? {},
      backendConflict:
        typeof l.backendConflict === 'boolean' ? l.backendConflict : false,
    };
  }

  /*───────────────────────────────────────────────
    🔥 CARGAR PAYLOAD NORMAL
  ───────────────────────────────────────────────*/
  async function loadPayload(data = {}) {
    loadingPayloadRef.current = true;
    try {
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
      const rawLineas = data.lineasServicio ?? data.orden?.lineasServicio ?? [];
      const lineasServicio = await Promise.all(
        (rawLineas || []).map(async (l) => {
          let tipoTrabajoObj = null;
          if (l.tipoTrabajo) {
            const idT =
              typeof l.tipoTrabajo === 'string'
                ? l.tipoTrabajo
                : l.tipoTrabajo._id;

            tipoTrabajoObj = extractRecord(await buscarTipoTrabajoPorId(idT));
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

      // Guardar originalRef
      const map = {};
      for (const linea of normalizedOrden.lineasServicio) {
        map[linea.uid] = JSON.parse(JSON.stringify(linea));
      }

      originalRef.current = {
        cliente: JSON.parse(JSON.stringify(clienteObj)),
        equipo: JSON.parse(JSON.stringify(normalizedEquipo)),
        tecnico: JSON.parse(JSON.stringify(tecnicoObj)),
        orden: {
          lineas: map,
          diagnosticoCliente: normalizedOrden.diagnosticoCliente,
          observaciones: normalizedOrden.observaciones,
          total: normalizedOrden.total,
          fechaIngreso: normalizedOrden.fechaIngreso,
        },
      };
    } finally {
      loadingPayloadRef.current = false;
    }
  }

  /*───────────────────────────────────────────────
    🔥 PRIMER USE EFFECT — SIMPLE
  ───────────────────────────────────────────────*/
  useEffect(() => {
    if (initOnce.current) return;
    initOnce.current = true;

    (async () => {
      if (!initialPayload) {
        // estado vacío
        await loadPayload({});
        setInitialSource('empty');
        setLoaded(true);
        return;
      }

      // payload inicial real
      await loadPayload(initialPayload);
      setInitialSource('initialPayload');
      setLoaded(true);
    })();
  }, []);

  /*───────────────────────────────────────────────
    🎁 API PÚBLICA (SIN AUTOSAVE LEGACY)
  ───────────────────────────────────────────────*/
  return {
    cliente,
    setCliente,
    equipo,
    setEquipo,
    tecnico,
    setTecnico,
    orden,
    setOrden,

    loadPayload,

    initialSource,
    loaded,
    loadingPayload: loadingPayloadRef.current,
    originalRef,
  };
}
