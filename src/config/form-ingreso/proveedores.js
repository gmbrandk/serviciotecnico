// config/proveedores.js (agregar)
import { apiProvider as tiposTrabajoApiProvider } from '@services/form-ingreso/tiposTrabajo/providers/apiProvider';
import { localStorageProvider as tiposTrabajoLocalProvider } from '@services/form-ingreso/tiposTrabajo/providers/localStorageProvider';

import { apiProvider as clientesApiProvider } from '@services/form-ingreso/clientes/providers/apiProvider';
import { localStorageProvider as clientesLocalProvider } from '@services/form-ingreso/clientes/providers/localStorageProvider';

import { apiProvider as equiposApiProvider } from '@services/form-ingreso/equipos/providers/apiProvider';
import { localStorageProvider as equiposLocalProvider } from '@services/form-ingreso/equipos/providers/localStorageProvider';

// Tecnicos providers
import { apiProvider as tecnicosApiProvider } from '@services/form-ingreso/tecnicos/providers/apiProvider';
import { localStorageProvider as tecnicosLocalProvider } from '@services/form-ingreso/tecnicos/providers/localStorageProvider';

export const mapaProveedoresTiposTrabajo = {
  local: {
    instancia: tiposTrabajoLocalProvider,
    nombre: 'Mock Local Tipos de Trabajo',
    tipo: 'mock',
  },
  api: {
    instancia: tiposTrabajoApiProvider,
    nombre: 'API REST Tipos de Trabajo',
    tipo: 'api',
  },
};

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

export const mapaProveedoresTecnicos = {
  local: {
    instancia: tecnicosLocalProvider,
    nombre: 'Mock Local Técnicos',
    tipo: 'mock',
  },
  api: {
    instancia: tecnicosApiProvider,
    nombre: 'API REST Técnicos',
    tipo: 'api',
  },
};
