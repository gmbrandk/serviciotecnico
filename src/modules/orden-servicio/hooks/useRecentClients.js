import { useEffect, useState } from 'react';

const STORAGE_KEY = 'recentClients';

export function useRecentClients() {
  const [recentClients, setRecentClients] = useState([]);

  // cargar desde localStorage al inicio
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    setRecentClients(stored);
  }, []);

  const addClient = (client) => {
    setRecentClients((prev) => {
      // eliminar duplicados por dni
      const filtered = prev.filter((c) => c.dni !== client.dni);

      // nuevo historial con cliente al inicio
      const updated = [client, ...filtered].slice(0, 10); // 👈 máximo 10

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return { recentClients, addClient };
}
