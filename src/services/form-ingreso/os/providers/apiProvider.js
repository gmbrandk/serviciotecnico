// services/form-ingreso/os/providers/apiProvider.js

const BASE_URL = 'http://localhost:5000/api/os';

export const apiProvider = {
  crearOrden: async (payload) => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return await res.json(); // ← { success, data, error, ... }
  },
};
