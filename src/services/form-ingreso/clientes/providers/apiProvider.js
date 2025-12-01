// services/clientes/providers/apiProvider.js

const BASE_URL = 'http://localhost:5000/api/clientes';

export const apiProvider = {
  // ======================================================
  // 🔍 AUTOCOMPLETE → /search?dni=XYZ&mode=autocomplete
  // ======================================================
  buscarCliente: async (dni) => {
    const url = `${BASE_URL}/search/?dni=${encodeURIComponent(
      dni
    )}&mode=autocomplete`;

    const res = await fetch(url, { credentials: 'include' });
    return await res.json();
  },

  // ======================================================
  // 📥 LOOKUP → /search?id=ID&mode=lookup
  // ======================================================
  buscarClientePorId: async (id) => {
    const url = `${BASE_URL}/search/?id=${encodeURIComponent(id)}&mode=lookup`;

    const res = await fetch(url, { credentials: 'include' });
    return await res.json();
  },

  // ======================================================
  // POST → crear un cliente real
  // ======================================================
  crearCliente: async (data) => {
    const res = await fetch(`${BASE_URL}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    return await res.json();
  },
};
