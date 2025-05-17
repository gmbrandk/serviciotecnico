// presets/index.js
import { codigosRowPreset } from './codigosPreset';
import { usuariosRowPreset } from './usuariosPreset';

export const getRowPreset = (tipo) => {
  switch (tipo) {
    case 'codigos': return codigosRowPreset;
    case 'usuarios': return usuariosRowPreset;
    case 'mascotas': return mascotasRowPreset;
    default: return { customConditions: [] };
  }
};
