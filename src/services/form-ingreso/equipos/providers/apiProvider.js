// services/equipos/providers/apiProviderEquipos.js
const BASE_URL = 'http://localhost:5000/api/equipos';

export const apiProvider = {
  // ======================================================
  // 🔍 AUTOCOMPLETE → /search?nroSerie=XYZ&mode=autocomplete&limit=10
  // ======================================================
  buscarEquipo: async (query) => {
    const url = `${BASE_URL}/search?nroSerie=${encodeURIComponent(
      query
    )}&mode=autocomplete&limit=10`;

    const res = await fetch(url, { credentials: 'include' });
    return await res.json();
  },

  // ======================================================
  // 📥 LOOKUP → /search?id=ID&mode=lookup
  // ======================================================
  buscarEquipoPorId: async (id) => {
    const url = `${BASE_URL}/search?id=${encodeURIComponent(
      id
    )}&mode=lookup&limit=5`;

    const res = await fetch(url, { credentials: 'include' });
    return await res.json();
  },
};
