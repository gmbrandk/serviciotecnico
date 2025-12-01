// hooks/useLookupUniversal.js
import { useEffect, useState } from 'react';

import { getClienteService } from '../services/clientes/clienteService';
import { getEquiposService } from '../services/equipos/equiposService';
import { getTecnicosService } from '../services/tecnicos/tecnicosService';
import { getTiposTrabajoService } from '../services/tiposTrabajo/tiposTrabajoService';

// Normalizadores
import { normalizarEquipo } from '../utils/normalizarEquipo';
import { normalizarTecnico } from '../utils/normalizarTecnico';

// Si tienes normalizarCliente y normalizarTipoTrabajo, sustitúyelos aquí
const normalizarCliente = (c) => c ?? null;
const normalizarTipoTrabajo = (t) => t ?? null;

export function useLookupUniversal({
  clienteId = null,
  equipoId = null,
  tecnicoId = null,
  tiposTrabajoIds = [],
}) {
  const [data, setData] = useState({
    cliente: null,
    representante: null,
    equipo: null,
    tecnico: null,
    tiposTrabajo: [],
  });

  const [loading, setLoading] = useState(false);

  const clienteSrv = getClienteService();
  const equiposSrv = getEquiposService();
  const tecnicosSrv = getTecnicosService();
  const tiposSrv = getTiposTrabajoService();

  useEffect(() => {
    let isMounted = true;
    async function run() {
      setLoading(true);

      const results = {
        cliente: null,
        representante: null,
        equipo: null,
        tecnico: null,
        tiposTrabajo: [],
      };

      const tasks = [];

      /* =============================
         1) CLIENTE
      ============================= */
      if (clienteId) {
        tasks.push(
          clienteSrv.buscarClientePorId(clienteId).then((res) => {
            const raw = res?.details?.results?.[0] ?? null;
            if (raw && isMounted) {
              results.cliente = normalizarCliente(raw);

              // Representante incluido en cliente
              if (raw.representante) {
                results.representante = normalizarCliente(raw.representante);
              }
            }
          })
        );
      }

      /* =============================
         2) EQUIPO
      ============================= */
      if (equipoId) {
        tasks.push(
          equiposSrv.buscarEquipoPorId(equipoId).then((res) => {
            const raw = res?.details?.results?.[0] ?? null;
            if (raw && isMounted) {
              results.equipo = normalizarEquipo(raw);
            }
          })
        );
      }

      /* =============================
         3) TÉCNICO
      ============================= */
      if (tecnicoId) {
        tasks.push(
          tecnicosSrv.buscarTecnicoPorId(tecnicoId).then((res) => {
            const raw = res?.details?.results?.[0] ?? null;
            if (raw && isMounted) {
              results.tecnico = normalizarTecnico(raw);
            }
          })
        );
      }

      /* =============================
         4) TIPOS DE TRABAJO (array)
      ============================= */
      if (Array.isArray(tiposTrabajoIds) && tiposTrabajoIds.length > 0) {
        const promises = tiposTrabajoIds.map((id) =>
          tiposSrv.buscarTipoTrabajoPorId(id).then((res) => {
            const raw = res?.details?.results?.[0] ?? null;
            return raw ? normalizarTipoTrabajo(raw) : null;
          })
        );

        tasks.push(
          Promise.all(promises).then((list) => {
            results.tiposTrabajo = list.filter(Boolean);
          })
        );
      }

      /* =============================
         Esperar todo
      ============================= */
      await Promise.all(tasks);

      if (isMounted) {
        setData(results);
        setLoading(false);
      }
    }

    run();

    return () => {
      isMounted = false;
    };
  }, [clienteId, equipoId, tecnicoId, tiposTrabajoIds.join('|')]);

  return { ...data, loading };
}
