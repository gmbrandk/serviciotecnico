// services/equipos/providers/localStorageProviderEquipos.js
import { equiposMock } from '@__mock__/form-ingreso/equipos';

// Enmascarar nroSerie como el backend
const maskStringEnding = (str, visibleEnd = 4) => {
  if (!str) return '';
  if (str.length <= visibleEnd) return '*'.repeat(str.length);
  const hidden = '*'.repeat(str.length - visibleEnd);
  return hidden + str.slice(-visibleEnd);
};

export const localStorageProvider = {
  // ======================================================
  // 🔍 AUTOCOMPLETE (simula /search?nroSerie=XYZ&mode=autocomplete)
  // ======================================================
  buscarEquipo: async (query) => {
    console.info('[EquiposMock] AUTOCOMPLETE → query:', query);

    const q = (query ?? '').toLowerCase().trim();

    if (!q) {
      return {
        success: true,
        ok: true,
        message: 'Query vacía',
        details: {
          count: 0,
          mode: 'autocomplete',
          isNew: false,
          results: [],
        },
      };
    }

    const matches = equiposMock.filter(
      (e) =>
        e.nroSerie?.toLowerCase().includes(q) ||
        e.marca?.toLowerCase().includes(q) ||
        e.modelo?.toLowerCase().includes(q)
    );

    // máscara backend → solo final visible
    const masked = matches.map((e) => ({
      _id: e._id,
      tipo: e.tipo,
      marca: e.marca,
      modelo: e.modelo,
      nroSerie: maskStringEnding(e.nroSerie, 4),
      sku: e.sku ?? null,
      macAddress: e.macAddress ? maskStringEnding(e.macAddress, 4) : null,
    }));

    return {
      success: true,
      ok: true,
      message: 'Equipos obtenidos correctamente',
      details: {
        count: masked.length,
        mode: 'autocomplete',
        isNew: false,
        results: masked,
      },
    };
  },

  // ======================================================
  // 📥 LOOKUP POR ID (simula /search?id=XYZ&mode=lookup)
  // ======================================================
  buscarEquipoPorId: async (id) => {
    console.info('[EquiposMock] LOOKUP → id:', id);

    const found = equiposMock.find((e) => e._id === id);

    return {
      success: true,
      ok: true,
      message: 'Equipo obtenido correctamente',
      details: {
        count: found ? 1 : 0,
        mode: 'lookup',
        isNew: false,
        results: found ? [found] : [],
      },
    };
  },
};
