import { fakeObjectId } from '../../../utils/fakeObjectIds';

const LOCAL_STORAGE_KEY = 'clientes_testing';

const simularLatencia = (res) =>
  new Promise((resolve) => setTimeout(() => resolve(res), 300));

const obtenerData = () => {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  const data = raw ? JSON.parse(raw) : [];
  console.info(`📦 [clientesProvider] Datos cargados (${data.length})`, data);
  return data;
};

const guardarData = (data) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  console.info(`💾 [clientesProvider] Datos guardados (${data.length})`, data);
};

export const localStorageProvider = {
  crearCliente: async (clienteData) => {
    console.group('🟢 crearCliente');
    console.log('📥 Datos recibidos (simulación envío backend):', clienteData);

    const data = obtenerData();

    // 🔹 Validaciones simples para simular errores
    if (!clienteData.nombres) {
      return simularLatencia({
        success: false,
        status: 400,
        code: 'REQUIRED_FIELD',
        message: 'El campo "nombres" es obligatorio',
        details: { field: 'nombres' },
      });
    }

    if (!clienteData.apellidos) {
      return simularLatencia({
        success: false,
        status: 400,
        code: 'REQUIRED_FIELD',
        message: 'El campo "apellidos" es obligatorio',
        details: { field: 'apellidos' },
      });
    }

    if (!/^\d{9}$/.test(clienteData.telefono || '')) {
      return simularLatencia({
        success: false,
        status: 400,
        code: 'INVALID_PHONE',
        message: 'El teléfono no es válido',
        details: { input: clienteData.telefono },
      });
    }

    if (!/^\d{8}$/.test(clienteData.dni || '')) {
      return simularLatencia({
        success: false,
        status: 400,
        code: 'INVALID_DNI',
        message: 'El DNI no es válido',
        details: { input: clienteData.dni },
      });
    }

    if (data.some((c) => c.dni === clienteData.dni)) {
      return simularLatencia({
        success: false,
        status: 400,
        code: 'DUPLICATE_DNI',
        message: 'Ya existe un cliente con este DNI',
        details: { field: 'dni', value: clienteData.dni },
      });
    }

    if (data.some((c) => c.email === clienteData.email)) {
      return simularLatencia({
        success: false,
        status: 400,
        code: 'DUPLICATE_EMAIL',
        message: 'Ya existe un cliente con este email',
        details: { field: 'email', value: clienteData.email },
      });
    }

    // 🔹 Si pasa validaciones, crear cliente
    const nuevoCliente = {
      ...clienteData,
      _id: fakeObjectId(),
      fechaRegistro: new Date().toISOString(),
      estado: 'activo',
      calificacion: 'regular',
      isActivo: true,
    };

    data.push(nuevoCliente);
    guardarData(data);

    console.log('✅ Cliente creado:', nuevoCliente);
    console.groupEnd();

    return simularLatencia({
      success: true,
      status: 201,
      code: 'CLIENTE_CREADO',
      message: 'Cliente creado correctamente',
      details: { cliente: nuevoCliente },
    });
  },
  generarEmails: async ({ nombres, apellidos }) => {
    // 🔹 Generar emails fake para mock
    const base = `${nombres}.${apellidos}`.toLowerCase().replace(/\s+/g, '');
    const sugerencias = [
      `${base}@gmail.com`,
      `${base}@hotmail.com`,
      `${base}@empresa.com`,
    ];

    return {
      success: true,
      status: 200,
      code: 'EMAILS_GENERADOS',
      message: 'Sugerencias de email generadas localmente',
      details: sugerencias,
    };
  },
  // 🔹 Nuevo método para limpiar storage
  resetClientes: () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    console.warn('🧹 [clientesProvider] Cache de clientes limpiada');
  },
};
