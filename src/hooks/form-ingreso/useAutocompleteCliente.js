import { useClientes } from '@context/form-ingreso/clientesContext';
import { clienteLog } from '@utils/debug/clienteLogger';
import { useEffect, useRef, useState } from 'react';

/*───────────────────────────────────────────────
  Hook UX puro
───────────────────────────────────────────────*/
export function useAutocompleteCliente({
  query,
  setQuery,
  minLength = 3,
  sourceRef,
}) {
  const { clientes, buscarClientes, buscarClientePorId } = useClientes();

  const [isOpen, setIsOpen] = useState(false);
  const isSelecting = useRef(false);
  const ignoreDebounce = useRef(false);

  /*───────────────────────────────────────────────
    Debounced search (solo intención de usuario)
  ───────────────────────────────────────────────*/
  useEffect(() => {
    // 🔥 IGNORAR hydrate
    if (sourceRef?.current === 'hydrate') {
      clienteLog('SKIP', 'AUTOCOMPLETE', 'hydrate-no-search');
      sourceRef.current = null; // 👈 consumir acción
      return;
    }

    if (ignoreDebounce.current || isSelecting.current) {
      ignoreDebounce.current = false;
      return;
    }

    const q = query.trim();
    if (!q || q.length < minLength) return;

    clienteLog('SEARCH', 'AUTOCOMPLETE', 'buscar-clientes', { q });

    const timeout = setTimeout(async () => {
      await buscarClientes(q);
      setIsOpen(true);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, minLength, buscarClientes, sourceRef]);

  /*───────────────────────────────────────────────
    Selección de cliente existente
  ───────────────────────────────────────────────*/
  const seleccionarCliente = async (c) => {
    if (!c?._id) return;

    clienteLog('SELECT', 'AUTOCOMPLETE', 'cliente-click', c);

    isSelecting.current = true;
    ignoreDebounce.current = true;

    setQuery(c.dni ?? '');
    setIsOpen(false);

    const full = await buscarClientePorId(c._id);

    isSelecting.current = false;

    return full ?? c;
  };

  return {
    resultados: clientes,
    isOpen,
    abrirResultados: () => setIsOpen(true),
    cerrarResultados: () => setTimeout(() => setIsOpen(false), 150),
    seleccionarCliente,
  };
}
