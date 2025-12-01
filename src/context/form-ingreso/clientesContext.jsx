// context/ClientesContext.jsx
import { createContext, useCallback, useContext, useState } from 'react';
import { getClienteService } from '@services/form-ingreso/clientes/ClienteService';
import { log } from '@utils/form-ingreso/log';

const ClientesContext = createContext(null);

export function ClientesProvider({ children }) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);

  // ======================================================
  // 🔍 AUTOCOMPLETE — buscar por DNI / nombre parcial
  //     usa: service.buscarCliente(query)
  // ======================================================
  const buscarClientes = useCallback(async (query) => {
    if (!query || query.trim().length === 0) {
      setClientes([]);
      return;
    }

    setLoading(true);

    try {
      const service = getClienteService();
      const res = await service.buscarCliente(query);

      log('CTX:CLIENTES', 'Respuesta service.buscarCliente', res);

      // Backend devuelve → details.results
      const lista = res?.details?.results ?? [];

      if (Array.isArray(lista)) {
        setClientes(lista);
      } else {
        console.warn('[CTX:CLIENTES] Respuesta inválida:', res);
        setClientes([]);
      }
    } catch (err) {
      console.error('[CTX:CLIENTES] Error buscando clientes', err);
      setClientes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ======================================================
  // 📥 LOOKUP POR ID — para poblar formulario
  //     usa: service.buscarClientePorId(id)
  // ======================================================
  const buscarClientePorId = useCallback(async (id) => {
    try {
      const service = getClienteService();
      const res = await service.buscarClientePorId(id);

      log('CTX:CLIENTES', 'Respuesta service.buscarClientePorId', res);

      // Backend devuelve results también aquí
      if (res?.success && Array.isArray(res?.details?.results)) {
        return res.details.results[0] || null;
      }

      return null;
    } catch (err) {
      console.error('[CTX:CLIENTES] Error en lookup por ID', err);
      return null;
    }
  }, []);

  return (
    <ClientesContext.Provider
      value={{
        clientes,
        loading,
        buscarClientes, // 🔍 autocomplete
        buscarClientePorId, // 📥 lookup para poblar formulario
      }}
    >
      {children}
    </ClientesContext.Provider>
  );
}

export const useClientes = () => useContext(ClientesContext);
