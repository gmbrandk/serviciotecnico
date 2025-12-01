// services/tecnicos/providers/apiProviderTecnicos.js
const BASE_URL = 'http://localhost:5000/api/usuarios';

export const apiProvider = {
  // ======================================================
  // 🔍 AUTOCOMPLETE → /usuarios?nombre=XYZ&mode=autocomplete
  // ======================================================
  buscarTecnico: async (query) => {
    const url = `${BASE_URL}?nombre=${encodeURIComponent(
      query
    )}&mode=autocomplete&limit=10`;

    const res = await fetch(url, { credentials: 'include' });
    return await res.json();
  },

  // ======================================================
  // 📥 LOOKUP → /usuarios?_id=ID
  // ======================================================
  buscarTecnicoPorId: async (id) => {
    const url = `${BASE_URL}?_id=${encodeURIComponent(id)}&mode=lookup`;

    const res = await fetch(url, { credentials: 'include' });
    return await res.json();
  },
};
