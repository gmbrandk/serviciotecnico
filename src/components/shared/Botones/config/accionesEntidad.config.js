// @config/accionesEntidad.config.js
import { Pencil, Trash2, Undo2 } from 'lucide-react';

export const accionesEntidad = {
  editar: {
    clave: 'editar',
    texto: 'Editar',
    textoAlternativo: null,
    icono: Pencil,
    iconoAlternativo: null,
    tipo: 'primario',
    tipoAlternativo: null,
    tooltip: 'Editar este registro',
    esAlternante: false,
    requierePermiso: true,
  },
  softDelete: {
    clave: 'softDelete',
    texto: 'Eliminar',
    textoAlternativo: 'Reactivar',
    icono: Trash2,
    iconoAlternativo: Undo2,
    tipo: 'peligro',
    tipoAlternativo: 'secundario',
    tooltip: 'Desactiva o reactiva el registro',
    esAlternante: true,
    requierePermiso: false,
  },
  crear: {
    clave: 'crear',
    texto: 'Crear',
    textoAlternativo: null,
    icono: Pencil,
    iconoAlternativo: null,
    tipo: 'primario',
    tipoAlternativo: null,
    tooltip: 'crear este registro',
    esAlternante: false,
    requierePermiso: true,
  },
};
