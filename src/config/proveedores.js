import { localStorageProvider } from '@services/usuarios/providers/localStorageProvider';
import { apiProvider } from '@services/usuarios/providers/apiProvider';

export const mapaProveedores = {
  local: {
    instancia: localStorageProvider,
    nombre: 'Mock Local',
    tipo: 'mock',
  },
  api: {
    instancia: apiProvider,
    nombre: 'API REST',
    tipo: 'api',
  },
};
