// ✅ src/context/equipo/EquipoContext.jsx
import { getEquipoService } from '@modules/orden-servicio/services/equipoService';
import { createContext, useCallback, useContext } from 'react';

const EquipoContext = createContext(null);

export function EquipoProvider({ children }) {
  const equipoService = getEquipoService();

  const crearEquipo = useCallback(async (data) => {
    try {
      return await equipoService.crearEquipo(data);
    } catch (error) {
      console.error('[EquipoContext] Error creando equipo:', error);
      return { success: false, message: 'Error interno creando equipo.' };
    }
  }, []);

  const obtenerEquipo = useCallback(async (id) => {
    try {
      return await equipoService.obtenerEquipo(id);
    } catch (error) {
      console.error('[EquipoContext] Error obteniendo equipo:', error);
      return { success: false, message: 'Error interno.' };
    }
  }, []);

  return (
    <EquipoContext.Provider value={{ crearEquipo, obtenerEquipo }}>
      {children}
    </EquipoContext.Provider>
  );
}

export function useEquipo() {
  const ctx = useContext(EquipoContext);
  if (!ctx) throw new Error('useEquipo debe usarse dentro de EquipoProvider');
  return ctx;
}
