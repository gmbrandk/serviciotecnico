import { getTiposTrabajoService } from '@services/form-ingreso/tiposTrabajo/tiposTrabajoService';
import { log } from '@utils/form-ingreso/log';
import { createContext, useContext, useEffect, useState } from 'react';

const TiposTrabajoContext = createContext(null);

export function TiposTrabajoProvider({ children }) {
  const [tiposTrabajo, setTiposTrabajo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  // ============================================================
  // 📦 CARGA INICIAL
  // ============================================================
  useEffect(() => {
    const cargar = async () => {
      try {
        const service = getTiposTrabajoService();
        const data = await service.listarTiposTrabajo();

        log('CTX:TIPOS', 'Respuesta service', data);

        if (data?.success && Array.isArray(data?.details?.tiposTrabajo)) {
          setTiposTrabajo(data.details.tiposTrabajo);
        } else {
          console.warn('[CTX:TIPOS] Respuesta inválida o sin array:', data);
          setTiposTrabajo([]);
        }
      } catch (err) {
        console.error('[CTX:TIPOS] Error cargando tipos de trabajo', err);
        setTiposTrabajo([]);
      } finally {
        setLoading(false);
        setReady(true); // 🔴 provider completamente inicializado
      }
    };

    cargar();
  }, []);

  // ============================================================
  // 🔍 Lookup por ID — híbrido memoria + API
  // ============================================================
  const buscarTipoTrabajoPorId = async (id) => {
    if (!id) {
      console.warn('[CTX:TIPOS] ID vacío o indefinido:', id);
      return null;
    }

    // 1️⃣ Intento buscarlo en memoria
    const found = tiposTrabajo.find((t) => t._id === id);
    if (found) return found;

    // 2️⃣ Sino, llamo al backend
    try {
      const service = getTiposTrabajoService();
      const result = await service.buscarTipoTrabajoPorId(id);

      if (result?.success && result.details) {
        setReady(true); // 🔴 provider respondió a lookup
        return result.details;
      }
    } catch (error) {
      console.error('[CTX:TIPOS] Error buscando tipoTrabajo por ID', error);
    }

    setReady(true);
    return null;
  };

  return (
    <TiposTrabajoContext.Provider
      value={{
        tiposTrabajo,
        loading,
        ready, // 🟢 EXPUESTO
        buscarTipoTrabajoPorId,
      }}
    >
      {children}
    </TiposTrabajoContext.Provider>
  );
}

export const useTiposTrabajo = () => useContext(TiposTrabajoContext);
