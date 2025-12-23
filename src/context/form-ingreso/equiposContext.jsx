import { getEquiposService } from '@services/form-ingreso/equipos/equipoService';
import { log } from '@utils/form-ingreso/log';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

const EquiposContext = createContext(null);

export function EquiposProvider({ children }) {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  // ======================================================
  // 🔍 AUTOCOMPLETE
  // ======================================================
  const buscarEquipos = useCallback(async (query) => {
    log('CTX', 'EQUIPOS', 'buscar:start', { query });

    if (!query?.trim()) {
      setEquipos([]);
      return;
    }

    setLoading(true);

    try {
      const res = await getEquiposService().buscarEquipo(query);
      log('CTX', 'EQUIPOS', 'buscar:raw-response', res);

      const lista = res?.details?.results ?? [];
      log('CTX', 'EQUIPOS', 'buscar:normalized-list', lista);

      setEquipos(Array.isArray(lista) ? lista : []);
    } catch (err) {
      console.error('[CTX:EQUIPOS] error', err);
      setEquipos([]);
    } finally {
      setLoading(false);
      setReady(true); // 🔴 provider ya fue tocado
    }
  }, []);

  // ======================================================
  // 🔎 LOOKUP POR ID
  // ======================================================
  const buscarEquipoPorId = useCallback(async (id) => {
    log('CTX', 'EQUIPOS', 'lookup:start', { id });

    try {
      const res = await getEquiposService().buscarEquipoPorId(id);
      log('CTX', 'EQUIPOS', 'lookup:raw-response', res);

      const equipo = res?.details?.results?.[0] ?? null;
      log('CTX', 'EQUIPOS', 'lookup:normalized', equipo);

      setReady(true); // 🔴 lookup exitoso o no, el provider ya respondió
      return equipo;
    } catch (err) {
      console.error('[CTX:EQUIPOS] lookup error', err);
      setReady(true);
      return null;
    }
  }, []);

  useEffect(() => {
    log('CTX', 'EQUIPOS', 'state:equipos-changed', equipos);
  }, [equipos]);

  return (
    <EquiposContext.Provider
      value={{
        equipos,
        loading,
        ready, // 🟢 EXPUESTO
        buscarEquipos,
        buscarEquipoPorId,
      }}
    >
      {children}
    </EquiposContext.Provider>
  );
}

export const useEquipos = () => useContext(EquiposContext);
