import { fakeObjectId } from '../../../utils/fakeObjectIds';

const LOCAL_STORAGE_KEY = 'equipos_testing';

const simularLatencia = (res) =>
  new Promise((resolve) => setTimeout(() => resolve(res), 300));

const obtenerData = () => {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  const data = raw ? JSON.parse(raw) : [];
  console.info(`📦 [equiposProvider] Datos cargados (${data.length})`, data);
  return data;
};

const guardarData = (data) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  console.info(`💾 [equiposProvider] Datos guardados (${data.length})`, data);
};

export const localStorageProvider = {
  crearEquipo: async (equipoData) => {
    console.group('🟢 crearEquipo');
    console.log('📥 Datos recibidos (simulación envío backend):', equipoData);

    const data = obtenerData();

    const nuevoEquipo = {
      ...equipoData,
      _id: fakeObjectId(), // 👈 aquí generamos el ID como en MongoDB
      fechaRegistro: new Date().toISOString(),
      estadoIdentificacion: 'temporal',
    };

    data.push(nuevoEquipo);
    guardarData(data);

    console.log('✅ Equipo creado:', nuevoEquipo);
    console.groupEnd();

    return simularLatencia({
      success: true,
      ok: true,
      message: 'Equipo creado correctamente',
      mensaje: 'Equipo creado correctamente',
      details: { equipo: nuevoEquipo },
    });
  },
};
