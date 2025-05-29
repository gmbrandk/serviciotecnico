import { usuariosMock } from '@__mock__/usuariosMock';

const LOCAL_STORAGE_KEY = 'usuarios_testing';

const simularLatencia = (res) =>
  new Promise((resolve) => setTimeout(() => resolve(res), 200));

export const localStorageProvider = {
  async obtenerUsuarios() {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      return simularLatencia(JSON.parse(data));
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(usuariosMock));
      return simularLatencia(usuariosMock);
    }
  },

  editarUsuario(id, nuevosDatos) {
    const data = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    const index = data.findIndex((u) => u._id === id);
    if (index !== -1) {
      data[index] = { ...data[index], ...nuevosDatos };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      return simularLatencia({ success: true });
    }
    return simularLatencia({
      success: false,
      mensaje: 'Usuario no encontrado',
    });
  },

  async toggleActivo(id) {
    const data = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    const index = data.findIndex((u) => u._id === id);
    if (index !== -1) {
      data[index].activo = !data[index].activo;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      return simularLatencia({
        success: true,
        mensaje: `Usuario ${data[index].activo ? 'activado' : 'desactivado'}`,
      });
    }
    return { success: false, mensaje: 'Usuario no encontrado' };
  },

  // ✅ Reset corregido
  reset: () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(usuariosMock));
    console.log('[Mock] Estado reiniciado con usuariosMock');
  },
};
