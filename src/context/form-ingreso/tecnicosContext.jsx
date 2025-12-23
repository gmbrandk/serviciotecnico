import { getTecnicosService } from '@services/form-ingreso/tecnicos/tecnicoService';
import { normalizarTecnico } from '@utils/form-ingreso/normalizarTecnico';
import { createContext, useCallback, useContext, useState } from 'react';

const TecnicosContext = createContext(null);

export function TecnicosProvider({ children }) {
  const { buscarTecnicos: buscarSrv, buscarTecnicoPorId: buscarIdSrv } =
    getTecnicosService();

  const [tecnicos, setTecnicos] = useState([]);
  const [ready, setReady] = useState(false);

  // ==========================================================
  // 🔍 AUTOCOMPLETE
  // ==========================================================
  const buscarTecnicos = useCallback(
    async (q) => {
      if (!q || q.trim().length < 2) {
        setTecnicos([]);
        return [];
      }

      const res = await buscarSrv(q);

      const lista =
        res?.details?.results ?? res?.usuarios ?? res?.results ?? [];

      const normalizados = lista.map((t) => normalizarTecnico(t));

      setTecnicos(normalizados);
      setReady(true); // 🔴 provider ya respondió

      return normalizados;
    },
    [buscarSrv]
  );

  // ==========================================================
  // 🔎 LOOKUP POR ID
  // ==========================================================
  const buscarTecnicoPorId = useCallback(
    async (id) => {
      if (!id) return null;

      const res = await buscarIdSrv(id);

      const item =
        res?.details?.results?.[0] ??
        res?.usuarios?.[0] ??
        res?.results?.[0] ??
        null;

      setReady(true); // 🔴 lookup completado
      return item ? normalizarTecnico(item) : null;
    },
    [buscarIdSrv]
  );

  return (
    <TecnicosContext.Provider
      value={{
        tecnicos,
        ready, // 🟢 EXPUESTO
        buscarTecnicos,
        buscarTecnicoPorId,
      }}
    >
      {children}
    </TecnicosContext.Provider>
  );
}

export const useTecnicos = () => useContext(TecnicosContext);
