// ✅ src/context/ordenServicio/OrdenServicioApiContext.jsx
import { getOrdenServicioService } from '@modules/orden-servicio/services/ordenServicioService';
import { createContext, useCallback, useContext } from 'react';

import '@modules/orden-servicio/clienteServiceInit';
import '@modules/orden-servicio/equipoServiceInit';
import '@modules/orden-servicio/ordenServicioServiceInit';

const OrdenServicioApiContext = createContext(null);

export function OrdenServicioApiProvider({ children }) {
  const osService = getOrdenServicioService();

  const buildPayload = useCallback((data) => {
    return osService.buildPayload(data);
  }, []);

  const crearOrdenServicio = useCallback(async (payload) => {
    try {
      // ✅ FIX: antes usabas crearOrden(), NO existe
      return await osService.crearOrdenServicio(payload);
    } catch (error) {
      console.error('[OSApiContext] Error creando OS:', error);
      return { success: false, message: 'Error creando Orden de Servicio.' };
    }
  }, []);

  const obtenerOrden = useCallback(async (id) => {
    try {
      return await osService.obtenerOrden?.(id);
    } catch (error) {
      console.error('[OSApiContext] Error obteniendo OS:', error);
      return { success: false, message: 'Error interno.' };
    }
  }, []);

  return (
    <OrdenServicioApiContext.Provider
      value={{ buildPayload, crearOrdenServicio, obtenerOrden }}
    >
      {children}
    </OrdenServicioApiContext.Provider>
  );
}

export function useOSApi() {
  const ctx = useContext(OrdenServicioApiContext);
  if (!ctx)
    throw new Error('useOSApi debe usarse dentro de OrdenServicioApiProvider');
  return ctx;
}
