import React from 'react';
import BotonAccion from './BotonAccion';
import { Pencil, Trash2, Undo2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { verificarPermisoMock } from '@__mock__/verificarPermisoMock';

const AccionesUsuario = ({
  usuario: usuarioObjetivo, // 👈 claridad semántica
  usuarioSolicitante, // 👈 nuevo nombre consistente
  onEditar,
  onToggleActivo,
}) => {
  const { permitido, mensaje } = verificarPermisoMock({
    solicitante: usuarioSolicitante,
    objetivo: usuarioObjetivo,
    accion: 'editar',
  });

  const handleEditarClick = () => {
    if (!permitido) {
      toast.error(mensaje);
      return;
    }
    onEditar(usuarioObjetivo);
  };

  return (
    <div>
      <BotonAccion
        texto="Editar"
        onClick={handleEditarClick}
        disabled={false}
        title={!permitido ? mensaje : 'Editar usuario'}
        tipo="primario"
        icono={<Pencil size={16} />}
        deshabilitadoVisual={!permitido}
      />

      <BotonAccion
        texto={usuarioObjetivo.activo ? 'Eliminar' : 'Reactivar'}
        onClick={() => onToggleActivo(usuarioObjetivo)}
        tipo={usuarioObjetivo.activo ? 'peligro' : 'secundario'}
        icono={
          usuarioObjetivo.activo ? <Trash2 size={16} /> : <Undo2 size={16} />
        }
      />
    </div>
  );
};

export default AccionesUsuario;
