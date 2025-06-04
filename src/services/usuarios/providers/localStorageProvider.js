import { usuariosMock } from '@__mock__/usuariosMock';
import { normalizedId } from '@utils/formatters';

const LOCAL_STORAGE_KEY = 'usuarios_testing';

const simularLatencia = (res) =>
  new Promise((resolve) => setTimeout(() => resolve(res), 200));

const obtenerData = () =>
  JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];

const guardarData = (data) =>
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));

export const localStorageProvider = {
  obtenerUsuarios: async () => {
    let data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) {
      guardarData(usuariosMock);
      data = usuariosMock;
    } else {
      data = JSON.parse(data);
    }

    console.log('[🧪 localStorageProvider] usuarios cargados');
    return simularLatencia(
      data.map((u) => ({
        ...u,
        id: normalizedId(u),
      }))
    );
  },

  editarUsuario: async (id, nuevosDatos) => {
    const data = obtenerData();
    const index = data.findIndex((u) => u._id === id);

    if (index !== -1) {
      data[index] = { ...data[index], ...nuevosDatos };
      guardarData(data);
      return simularLatencia({ success: true });
    }

    return simularLatencia({
      success: false,
      mensaje: 'Usuario no encontrado',
    });
  },

  cambiarEstadoUsuario: async (id, activo) => {
    const data = obtenerData();
    const index = data.findIndex((u) => u._id === id);

    if (index !== -1) {
      data[index].activo = activo;
      guardarData(data);
      return simularLatencia({
        success: true,
        mensaje: `Usuario ${activo ? 'activado' : 'desactivado'}`,
      });
    }

    return simularLatencia({
      success: false,
      mensaje: 'Usuario no encontrado',
    });
  },

  cambiarRolUsuario: async (id, nuevoRol, contrasenaConfirmacion = '') => {
    const data = obtenerData();
    const index = data.findIndex((u) => u._id === id);

    if (index !== -1) {
      data[index].role = nuevoRol;
      guardarData(data);
      return simularLatencia({ success: true });
    }

    return simularLatencia({
      success: false,
      mensaje: 'Usuario no encontrado',
    });
  },

  cambiarPasswordUsuario: async (
    id,
    { passwordActual, nuevaPassword, confirmarPassword }
  ) => {
    const data = obtenerData();
    const index = data.findIndex((u) => u._id === id);

    if (index === -1) {
      return simularLatencia({
        success: false,
        mensaje: 'Usuario no encontrado',
      });
    }

    if (nuevaPassword !== confirmarPassword) {
      return simularLatencia({
        success: false,
        mensaje: 'Las contraseñas no coinciden',
      });
    }

    if (data[index].password !== passwordActual) {
      return simularLatencia({
        success: false,
        mensaje: 'Contraseña actual incorrecta',
      });
    }

    data[index].password = nuevaPassword;
    guardarData(data);

    return simularLatencia({
      success: true,
      mensaje: 'Contraseña actualizada exitosamente',
    });
  },

  reset: () => {
    guardarData(usuariosMock);
    console.log('[🧪 localStorageProvider] Estado reiniciado con usuariosMock');
  },
};
