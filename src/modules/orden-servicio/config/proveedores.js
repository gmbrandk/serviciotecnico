import { apiProvider as clientesApiProvider } from '../services/clientes/providers/apiProvider';
import { localStorageProvider as clientesLocalProvider } from '../services/clientes/providers/localStorageProvider';

import { apiProvider as equiposApiProvider } from '../services/equipos/providers/apiProvider';
import { localStorageProvider as equiposLocalProvider } from '../services/equipos/providers/localStorageProvider';

import { apiProvider as ordenServicioApiProvider } from '../services/ordenServicio/providers/apiProvider';
import { localStorageProvider as ordenServicioMockProvider } from '../services/ordenServicio/providers/localStorageProvider';

export const mapaProveedoresClientes = {
  local: {
    instancia: clientesLocalProvider,
    nombre: 'Mock Local Clientes',
    tipo: 'mock',
  },
  api: {
    instancia: clientesApiProvider,
    nombre: 'API REST Clientes',
    tipo: 'api',
  },
};

export const mapaProveedoresEquipos = {
  local: {
    instancia: equiposLocalProvider,
    nombre: 'Mock Local Equipos',
    tipo: 'mock',
  },
  api: {
    instancia: equiposApiProvider,
    nombre: 'API REST Equipos',
    tipo: 'api',
  },
};

export const mapaProveedoresOrdenes = {
  local: {
    instancia: ordenServicioMockProvider,
    nombre: 'Mock Local Ordenes de Servicio',
    tipo: 'mock',
  },
  api: {
    instancia: ordenServicioApiProvider,
    nombre: 'API REST Ordenes de Servicio',
    tipo: 'api',
  },
};
