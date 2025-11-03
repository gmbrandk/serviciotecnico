import { fakeObjectId } from '../../../utils/fakeObjectIds';
const LOCAL_STORAGE_KEY = 'ordenes_testing';

const simularLatencia = (res) =>
  new Promise((resolve) => setTimeout(() => resolve(res), 400));

const obtenerData = () => {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  const data = raw ? JSON.parse(raw) : [];
  console.info(
    `📦 [localStorageProvider] Datos cargados (${data.length})`,
    data
  );
  return data;
};

const guardarData = (data) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  console.info(
    `💾 [localStorageProvider] Datos guardados (${data.length})`,
    data
  );
};

export const localStorageProvider = {
  crearOrdenServicio: async (ordenData) => {
    console.group('🟢 crearOrdenServicio');
    console.log('📥 Datos recibidos:', ordenData);

    const data = obtenerData();

    const nuevaOrden = {
      ...ordenData,
      _id: fakeObjectId(), // 👈 aquí generamos el ID como en MongoDB
      codigo: `OS-${Math.floor(Math.random() * 9000 + 1000)}`,
      estadoOS: 'pendiente',
      createdAt: new Date().toISOString(),
    };

    data.push(nuevaOrden);
    guardarData(data);

    console.log('✅ Orden creada:', nuevaOrden);
    console.groupEnd();

    return simularLatencia({
      success: true,
      ok: true,
      message: `Orden de servicio ${nuevaOrden.codigo} creada correctamente`,
      mensaje: `Orden de servicio ${nuevaOrden.codigo} creada correctamente`,
      details: { orden: nuevaOrden },
    });
  },

  finalizarOrdenServicio: async (ids, orden) => {
    console.group('🔴 finalizarOrdenServicio');
    console.log('📥 IDs recibidos:', ids);
    console.log('📥 Datos recibidos:', orden);

    const data = obtenerData();
    const idx = data.findIndex((o) => o._id === ids?.ordenId);

    let finalizada = null;
    if (idx !== -1) {
      data[idx] = {
        ...data[idx],
        ...orden,
        estadoOS: 'finalizada',
        fechaFinalizacion: new Date().toISOString(),
      };
      finalizada = data[idx];
      guardarData(data);
      console.log('✅ Orden finalizada:', finalizada);
    } else {
      console.warn('⚠️ Orden no encontrada en localStorage', ids?.ordenId);
    }

    console.groupEnd();

    return simularLatencia({
      success: true,
      ok: true,
      message: finalizada
        ? `Orden ${finalizada.codigo} finalizada correctamente`
        : 'Orden no encontrada',
      details: { orden: finalizada },
    });
  },
};
