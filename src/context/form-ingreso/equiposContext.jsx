import { createContext, useCallback, useContext, useState } from 'react';
import { getEquiposService } from '@services/form-ingreso/equipos/equipoService';
import { log } from '@utils/form-ingreso/log';

const EquiposContext = createContext(null);

export function EquiposProvider({ children }) {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(false);

  // AUTOCOMPLETE
  const buscarEquipos = useCallback(async (query) => {
    if (!query || query.trim().length === 0) {
      setEquipos([]);
      return;
    }

    setLoading(true);

    try {
      const service = getEquiposService();
      const res = await service.buscarEquipo(query);

      log('CTX:EQUIPOS', 'Respuesta service.buscarEquipo', res);

      const lista = res?.details?.results ?? [];

      if (Array.isArray(lista)) {
        setEquipos(lista);
      } else {
        console.warn('[CTX:EQUIPOS] Respuesta inválida:', res);
        setEquipos([]);
      }
    } catch (err) {
      console.error('[CTX:EQUIPOS] Error buscando equipos', err);
      setEquipos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // LOOKUP PARA FORMULARIO
  const buscarEquipoPorId = useCallback(async (id) => {
    try {
      const service = getEquiposService();
      const res = await service.buscarEquipoPorId(id);

      log('CTX:EQUIPOS', 'Respuesta service.buscarEquipoPorId', res);

      if (res?.success && Array.isArray(res?.details?.results)) {
        return res.details.results[0] || null;
      }

      return null;
    } catch (err) {
      console.error('[CTX:EQUIPOS] Error en lookup por ID', err);
      return null;
    }
  }, []);

  return (
    <EquiposContext.Provider
      value={{
        equipos,
        loading,
        buscarEquipos,
        buscarEquipoPorId,
      }}
    >
      {children}
    </EquiposContext.Provider>
  );
}

export const useEquipos = () => useContext(EquiposContext);
