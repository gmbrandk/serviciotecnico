// ✅ src/context/cliente/ClienteContext.jsx
import { getClienteService } from '@modules/orden-servicio/services/clienteService';
import { createContext, useCallback, useContext } from 'react';

const ClienteContext = createContext(null);

export function ClienteProvider({ children }) {
  const clienteService = getClienteService();

  const crearCliente = useCallback(async (data) => {
    try {
      return await clienteService.crearCliente(data);
    } catch (error) {
      console.error('[ClienteContext] Error creando cliente:', error);
      return { success: false, message: 'Error interno creando cliente.' };
    }
  }, []);

  const obtenerCliente = useCallback(async (id) => {
    try {
      return await clienteService.obtenerCliente(id);
    } catch (error) {
      console.error('[ClienteContext] Error obteniendo cliente:', error);
      return { success: false, message: 'Error interno.' };
    }
  }, []);

  return (
    <ClienteContext.Provider value={{ crearCliente, obtenerCliente }}>
      {children}
    </ClienteContext.Provider>
  );
}

export function useCliente() {
  const ctx = useContext(ClienteContext);
  if (!ctx) throw new Error('useCliente debe usarse dentro de ClienteProvider');
  return ctx;
}
