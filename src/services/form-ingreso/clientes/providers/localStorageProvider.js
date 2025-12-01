// services/clientes/providers/localStorageProvider.js
import { clientesMock } from '@__mock__/form-ingreso/clientes';

const maskString = (str, visible = 3) => {
  if (!str) return '';
  if (str.length <= visible) return '*'.repeat(str.length);
  const hidden = '*'.repeat(str.length - visible);
  return str.slice(0, visible) + hidden;
};

export const localStorageProvider = {
  // ======================================================
  // 🔍 AUTOCOMPLETE (simula /search?dni=XYZ&mode=autocomplete)
  // ======================================================
  buscarCliente: async (query) => {
    console.info('[ClientesMock] AUTOCOMPLETE → query:', query);

    const q = (query ?? '').toLowerCase().trim();

    if (!q) {
      return {
        success: true,
        ok: true,
        message: 'Query vacía',
        details: { count: 0, mode: 'autocomplete', isNew: false, results: [] },
      };
    }

    // filtro parcial
    const matches = clientesMock.filter(
      (c) =>
        c.dni?.toLowerCase().includes(q) ||
        c.nombres?.toLowerCase().includes(q) ||
        c.apellidos?.toLowerCase().includes(q)
    );

    // Emula enmascarado del backend
    const maskedResults = matches.map((c) => ({
      _id: c._id,
      dni: maskString(c.dni, 2),
      nombres: maskString(c.nombres, 5),
      apellidos: maskString(c.apellidos, 5),
      telefono: maskString(c.telefono, 2),
      email: maskString(c.email, 1),
    }));

    return {
      success: true,
      ok: true,
      message: 'Clientes obtenidos correctamente',
      details: {
        count: maskedResults.length,
        mode: 'autocomplete',
        isNew: false,
        results: maskedResults,
      },
    };
  },

  // ======================================================
  // 📥 LOOKUP POR ID (simula /search?id=XYZ&mode=lookup)
  // ======================================================
  buscarClientePorId: async (id) => {
    console.info('[ClientesMock] LOOKUP → id:', id);

    const found = clientesMock.find((c) => c._id === id);

    return {
      success: true,
      ok: true,
      message: 'Cliente obtenido correctamente',
      details: {
        count: found ? 1 : 0,
        mode: 'lookup',
        results: found ? [found] : [],
      },
    };
  },

  // ======================================================
  // POST → crear cliente
  // ======================================================
  crearCliente: async (data) => {
    console.info('[ClientesMock] creando cliente...', data);

    const nuevo = { ...data, _id: 'mock-' + Date.now() };

    clientesMock.push(nuevo);

    return {
      success: true,
      ok: true,
      status: 201,
      message: 'Cliente creado localmente',
      details: { cliente: nuevo },
    };
  },
};
