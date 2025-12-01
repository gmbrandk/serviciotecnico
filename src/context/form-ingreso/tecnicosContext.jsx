// context/TecnicosContext.jsx
import { createContext, useCallback, useContext, useState } from 'react';
import { getTecnicosService } from '@services/form-ingreso/tecnicos/tecnicoService';
import { normalizarTecnico } from '@utils/form-ingreso/normalizarTecnico';

const TecnicosContext = createContext(null);

export function TecnicosProvider({ children }) {
  const { buscarTecnicos: buscarSrv, buscarTecnicoPorId: buscarIdSrv } =
    getTecnicosService();

  const [tecnicos, setTecnicos] = useState([]);

  // ==========================================================
  // 🔍 AUTOCOMPLETE
  // ==========================================================
  const buscarTecnicos = useCallback(
    async (q) => {
      // console.log('%c[CTX TECNICOS] Buscando técnicos:', 'color:#3F51B5', q);

      if (!q || q.trim().length < 2) {
        // console.log(
        //   '%c[CTX TECNICOS] Query muy corta → reset',
        //   'color:#FF9800'
        // );
        setTecnicos([]);
        return [];
      }

      const res = await buscarSrv(q);

      // console.log('%c[CTX TECNICOS] Respuesta provider:', 'color:#9C27B0', res);

      // 🚀 SOPORTE UNIVERSAL (mock + API real)
      const lista =
        res?.details?.results ?? res?.usuarios ?? res?.results ?? [];

      // console.log('%c[CTX TECNICOS] Lista detectada:', 'color:#009688', lista);

      const normalizados = lista.map((t) => normalizarTecnico(t));

      // console.log(
      //   '%c[CTX TECNICOS] Normalizados:',
      //   'color:#4CAF50',
      //   normalizados
      // );

      setTecnicos(normalizados);
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

      // Soporte universal
      const item =
        res?.details?.results?.[0] ??
        res?.usuarios?.[0] ??
        res?.results?.[0] ??
        null;

      return item ? normalizarTecnico(item) : null;
    },
    [buscarIdSrv]
  );

  return (
    <TecnicosContext.Provider
      value={{
        tecnicos,
        buscarTecnicos,
        buscarTecnicoPorId,
      }}
    >
      {children}
    </TecnicosContext.Provider>
  );
}

export const useTecnicos = () => useContext(TecnicosContext);
